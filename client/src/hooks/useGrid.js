import {
  // Fragment,
  // createContext,
  // memo,
  // useContext,
  useRef,
  useMemo,
  useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';


/*
0   has not drawn
1   completed initial draw
*/


export default function useGrid({
  width,
  height,
  colors,
  scalar,
  socketActive,
  addListener,
  cursorMode,
  activeColor,
} = {}) {


  const [gridStatus, setGridStatus] = useState(0);
  const [redrawGridFlag, setRedrawGridFlag] = useState(false);
  const [redrawCel, setRedrawCel] = useState(null);
  const [lastDraw, setLastDraw] = useState(0);

  const dataRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const gridCtx = useRef(null);
  const mapCanvasRef = useRef(null);
  const mapCtx = useRef(null);
  const offCanvasRef = useRef(null);
  const offCtx = useRef(null);



///////////////////////////////////////
// Socket
///////////////////////////////////////

  const handleUpdateGrid = useCallback(newGrid => {
    dataRef.current = newGrid;
    setRedrawGridFlag(true);
  }, [dataRef, setRedrawGridFlag]);


  const handleUpdateCel = useCallback(newCel => {
    const { _id, current } = newCel;
    const cel = dataRef.current[_id];
    cel.current = current;
    setRedrawCel(cel);
  }, [dataRef, setRedrawCel]);


  const handleUpdateLastDraw = useCallback(timestamp => {
    setLastDraw(timestamp);
  }, [setLastDraw]);


  const handleSocketMessage = useCallback((action, payload) => {
    // console.log("socket message in GRID --- ", action)
    switch (action) {
      case 'update_grid':
        handleUpdateGrid(payload);
        break;
      case 'update_cel':
        handleUpdateCel(payload);
        break;
      case 'update_last_draw':
        handleUpdateLastDraw(payload);
        break;
      default:
        console.log('Socket --- Unhandled Message in useGrid:', action, payload);
        return null;
    };
  }, [handleUpdateGrid, handleUpdateCel, handleUpdateLastDraw]);


  const post = useMemo(() => {
    return addListener(handleSocketMessage);
  }, [addListener, handleSocketMessage]);


  const postUpdatedCel = useCallback((cel_id, color) => {
    post('set_cel', { cel_id, color, t: Date.now() });
  }, [post]);


  useEffect(() => {   // get grid data from socket
    if (socketActive && post) {
      post('get_grid');
    };
  }, [socketActive, post]);



///////////////////////////////////////
// Paint click
///////////////////////////////////////

  const celLookupMatrix = useMemo(() => {
    if (!width || !height) return null;
    // const makeId = (c, r) => `c${c}r${r}`;
    const makeI = (c, r) => (r * width) + c;
    const makeRow = (r) => (new Array(width).fill(''))
      .map((d, c) => makeI(c, r));
    const matrix = (new Array(height).fill(''))
      .map((d, r) => makeRow(r));
    return matrix;
  }, [width, height]);


  const paintCel = useCallback((c, r) => {
    if (cursorMode !== 1) return null;
    const celI = celLookupMatrix[r][c];
    const cel = dataRef.current[celI];
    if (!cel) return null;
    cel.current.color = activeColor;
    setRedrawCel(cel);
    postUpdatedCel(cel.cel_id, activeColor);
  }, [cursorMode, celLookupMatrix, dataRef, activeColor, setRedrawCel, postUpdatedCel]);



///////////////////////////////////////
// CANVAS
///////////////////////////////////////

  const canvasColorSquares = useMemo(() => {
    if (!colors) return null;
    const colorSquares = colors.map(d => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = d;
      ctx.fillRect(0, 0, 1, 1);
      return canvas;
    });
    return colorSquares;
  }, [colors]);


  useEffect(() => {   // set the onscreen canvas dimensions to match its display size; get context; same for offscreen canvas
    const gridCanvas = gridCanvasRef.current;
    if (width && height && gridCanvas) {
      const targetW = width * scalar;
      const targetH = height * scalar;
    // set main canvas
      gridCanvas.width = targetW;
      gridCanvas.height = targetH;
      gridCtx.current = gridCanvas.getContext('2d');
      gridCtx.current.imageSmoothingEnabled = false;
    // set offscreen canvas
      if (typeof OffscreenCanvas !== 'undefined') {
        offCanvasRef.current = new OffscreenCanvas(targetW, targetH);
      } else {
        offCanvasRef.current = document.createElement('canvas');
        offCanvasRef.current.width = targetW;
        offCanvasRef.current.height = targetH;
      };
      offCtx.current = offCanvasRef.current.getContext('2d');
      offCtx.current.imageSmoothingEnabled = false;
      offCtx.current.scale(scalar, scalar);
    };
  }, [width, height, scalar, gridCanvasRef, gridCtx, offCanvasRef, offCtx]);


  useEffect(() => {   // set minimap canvas
    const mapCanvas = mapCanvasRef.current;
    if (mapCanvas) {
      const { clientWidth, clientHeight } = mapCanvas;
      mapCanvas.width = clientWidth * 4;
      mapCanvas.height = clientHeight * 4;
      mapCtx.current = mapCanvas.getContext('2d');
      mapCtx.current.imageSmoothingEnabled = false;
    };
  }, [mapCanvasRef, mapCtx]);


  const drawOffscreen = useCallback((data = []) => {
    const oCtx = offCtx.current;
    if (!oCtx) return null;

    data.forEach(d => {
      const { row, col, current: { color } } = d;
      oCtx.drawImage(canvasColorSquares[color], col, row, 1, 1);
    });
    return oCtx.canvas;
  }, [offCtx, canvasColorSquares]);


  const drawToGrid = useCallback((data  = []) => {
    const gCtx = gridCtx.current;
    const mCtx = mapCtx.current;
    if (!gCtx || !mCtx) return null;

    const offScreen = drawOffscreen(data);
    gCtx.drawImage(offScreen, 0, 0);
    mCtx.drawImage(offScreen, 0, 0, mCtx.canvas.width, mCtx.canvas.height);
    return true;
  }, [gridCtx, mapCtx, drawOffscreen]);





  useEffect(() => {   // redraw entire grid
    if (redrawGridFlag) {
      const redrawn = drawToGrid(dataRef.current);
      setRedrawGridFlag(!redrawn);
    };
  }, [redrawGridFlag, setRedrawGridFlag, dataRef, drawToGrid]);


  useEffect(() => {   // redraw single cel
    if (redrawCel) {
      const redrawn = drawToGrid([redrawCel]);
      setRedrawCel(!redrawn);
    };
  }, [redrawCel, setRedrawCel, drawToGrid]);



  useEffect(() => {
    if (redrawGridFlag && !gridStatus) {
      setGridStatus(1);
    };
  }, [redrawGridFlag, gridStatus, setGridStatus]);



  return {
    gridReady: !!gridStatus,
    gridCanvas: gridCanvasRef,
    gridMapCanvas: mapCanvasRef,
    gridPaintCel: paintCel,
    gridLastDraw: lastDraw,
  };
};
