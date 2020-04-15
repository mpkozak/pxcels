import React, { memo, useState, useEffect, useMemo, useLayoutEffect, useRef, useCallback } from 'react';
import './App2.css';
import { useParams, useTouchDetect, useTouchZoomOverride, useSocket } from './hooks';
import { Colors, Cursors, Minimap } from './components';
// import User from './User.jsx';





function useGrid({ params, activeColor, cursorMode, canvasRef, mapCanvasRef, oversamplePx = 1 } = {}) {

  const [redrawGridFlag, setRedrawGridFlag] = useState(false);
  const [redrawCel, setRedrawCel] = useState(null);
  const [lastDraw, setLastDraw] = useState(0);
  const dataRef = useRef(null);



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


  const handleSocketMessage = useCallback(({ type, payload }) => {
    switch (type) {
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
        console.log('Socket --- Unhandled Message in useGrid:', type, payload);
        return null;
    };
  }, [handleUpdateGrid, handleUpdateCel, handleUpdateLastDraw]);


  const { active, post, username, postUsername } = useSocket(handleSocketMessage);


  useEffect(() => {   // get grid data from socket
    if (active) {
      post('get_grid');
    };
  }, [active, post]);



///////////////////////////////////////
// Paint click
///////////////////////////////////////

  const celLookupMatrix = useMemo(() => {
    if (!params) return null;
    const { width, height } = params;
    // const makeId = (c, r) => `c${c}r${r}`;
    const makeI = (c, r) => (r * width) + c;
    const makeRow = (r) => (new Array(width).fill(''))
      .map((d, c) => makeI(c, r));
    const matrix = (new Array(height).fill(''))
      .map((d, r) => makeRow(r));
    return matrix;
  }, [params]);


  const clickCel = useCallback((c, r) => {
    if (cursorMode !== 'paint' || !~activeColor ) {
      return null;
    };
    const celI = celLookupMatrix[r][c];
    const cel = dataRef.current[celI];
    if (!cel) {
      return null;
    };
    cel.current.color = activeColor;
    setRedrawCel(cel);
    post('set_cel', { cel_id: cel.cel_id, color: cel.current.color, t: Date.now() });
  }, [cursorMode, activeColor, dataRef, celLookupMatrix, setRedrawCel, post]);



///////////////////////////////////////
// CANVAS
///////////////////////////////////////

  const scalar = useMemo(() => window.devicePixelRatio * oversamplePx, [oversamplePx]);

  const canvasColorSquares = useMemo(() => {
    if (!params) return null;
    const { colors } = params;
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
  }, [params]);


  const ctx = useRef(null);
  const mapCtx = useRef(null);
  const offscreenCanvas = useRef(null);
  const offCtx = useRef(null);


  useEffect(() => {   // set the onscreen canvas dimensions to match its display size; get context; same for offscreen canvas
    const canvas = canvasRef.current;
    if (params && canvas) {
      const { width, height } = params;
      const targetW = width * scalar;
      const targetH = height * scalar;
    // set main canvas
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.current = canvas.getContext('2d');
      ctx.current.imageSmoothingEnabled = false;
    // set offscreen canvas
      if (typeof OffscreenCanvas !== 'undefined') {
        offscreenCanvas.current = new OffscreenCanvas(targetW, targetH);
      } else {
        offscreenCanvas.current = document.createElement('canvas');
        offscreenCanvas.current.width = targetW;
        offscreenCanvas.current.height = targetH;
      };
      offCtx.current = offscreenCanvas.current.getContext('2d');
      offCtx.current.imageSmoothingEnabled = false;
      offCtx.current.scale(scalar, scalar);
    };
  }, [params, canvasRef, mapCanvasRef, scalar, ctx, offscreenCanvas, offCtx]);


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
    const ctx = offCtx.current;
    if (!ctx) return null;

    data.forEach(d => {
      const { row, col, current: { color } } = d;
      ctx.drawImage(canvasColorSquares[color], col, row, 1, 1);
    });
    return ctx.canvas;
  }, [offCtx, canvasColorSquares]);


  const drawGrid = useCallback((data  = []) => {
    const c = ctx.current;
    const mc = mapCtx.current;
    if (!c || !mc) return null;

    const offScreen = drawOffscreen(data);
    c.drawImage(offScreen, 0, 0);
    mc.drawImage(offScreen, 0, 0, mc.canvas.width, mc.canvas.height);
    return null;
  }, [ctx, mapCtx, drawOffscreen]);


  const drawCel = useCallback((datum) => {
    const c = ctx.current;
    const mc = mapCtx.current;
    if (!c || !mc) return null;

    const offScreen = drawOffscreen([datum]);
    c.drawImage(offScreen, 0, 0);
    mc.drawImage(offScreen, 0, 0, mc.canvas.width, mc.canvas.height);
    return null;
  }, [ctx, mapCtx, drawOffscreen]);



  useEffect(() => {
    if (redrawGridFlag) {
      const redrawn = drawGrid(dataRef.current);
      setRedrawGridFlag(redrawn);
    };
  }, [redrawGridFlag, setRedrawGridFlag, dataRef, drawGrid]);


  useEffect(() => {
    if (redrawCel) {
      const redrawn = drawCel(redrawCel);
      setRedrawCel(redrawn);
    };
  }, [redrawCel, setRedrawCel, drawCel]);



  const [gridStatus, setGridStatus] = useState(0);

  useEffect(() => {
    if (redrawGridFlag && !gridStatus) {
      setGridStatus(1)
    };
  }, [redrawGridFlag, gridStatus, setGridStatus]);



  return {
    gridStatus,
    scalar,
    clickCel,
  };
};





const GridLines = memo(function GridLines({ width = 0, height = 0, pxWidth, pxHeight } = {}) {
  const cols = useMemo(() => {
    return (new Array(1 + width).fill('')).map((d, i) =>
      <path key={`x${i}`} d={`M ${i} ${height} L ${i} 0`} />
    );
  }, [width, height]);

  const rows = useMemo(() => {
    return (new Array(1 + height).fill('')).map((d, i) =>
      <path key={`y${i}`} d={`M 0 ${i} L ${width} ${i}`} />
    );
  }, [width, height]);

  const strokeWidth = useMemo(() => {
    const sw = (width / pxWidth);
    if (isNaN(sw) || sw > .1) {
      return 0;
    };
    return sw;
  }, [width, pxWidth]);


  if (!strokeWidth) return null;

  return (
    <svg
      className="Grid--lines"
      width={pxWidth}
      height={pxHeight}
      viewBox={`0 0 ${width} ${height}`}
    >
      <g strokeWidth={strokeWidth}>
        {rows}
        {cols}
      </g>
    </svg>
  );
});





const Grid = memo(function Grid({
  windowRef,
  canvasRef,
  touchRef,
  cursorMode,
  width,
  height,
  scalar,
  zoom,
  clickCel = null,
  touchStart = null,
} = {}) {


/*
    TOUCH EVENTS
*/



/*
    MOUSE EVENTS
*/

  const [drag, setDrag] = useState(false);


  const handleDragStart = useCallback(e => {
    if (cursorMode === 'paint') {
      return null;
    };
    setDrag(true);
  }, [cursorMode, setDrag]);


  const handleDragEnd = useCallback(e => {
    setDrag(false);
  }, [setDrag]);


  const handleDragMove = useCallback(e => {
    const el = windowRef.current;
    el.scrollBy(-e.movementX, -e.movementY);
  }, [windowRef]);


  useEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [drag, handleDragMove, handleDragEnd]);


  const handleClickCel = useCallback(e => {
    const { clientX, clientY } = e;
    const { x, y } = e.target.getBoundingClientRect();
    const cX = Math.floor((clientX - x) / (scalar * zoom));
    const cY = Math.floor((clientY - y) / (scalar * zoom));
    clickCel(cX, cY);
  }, [scalar, zoom, clickCel]);



  const baseWidth = useMemo(() => scalar * width, [scalar, width]);
  const baseHeight = useMemo(() => scalar * height, [scalar, height]);
  const pxWidth = baseWidth * zoom;
  const pxHeight = baseHeight * zoom;

  return (
    <div
      className="Grid--window"
      ref={windowRef}
      onMouseDown={handleDragStart}
    >
      <div className="Grid--flex-wrap">
        <div className="Grid--wrap">
            <div
              ref={touchRef}
              className="Grid--canvas-wrap"
              style={{
                width: pxWidth + 'px',
                height: pxHeight + 'px',
              }}
              onTouchStart={touchStart}
              // onTouchMove={handleTouchMove}
              // onTouchEnd={handleTouchEnd}
            >
              <canvas
                className="Grid"
                ref={canvasRef}
                style={{
                  transform: `scale(${zoom})`,
                  cursor: cursorMode === 'paint'
                    ? 'crosshair'
                    : (drag ? 'move' : 'grab'),
                   }}
                onClick={handleClickCel}
              />
              <GridLines
                width={width}
                height={height}
                pxWidth={pxWidth}
                pxHeight={pxHeight}
              />
            </div>
        </div>
      </div>
    </div>
  );
});










function useViewportScalar({ width, height, scalar } = {}) {
  const minScale = useMemo(() => {
    const minViewportDimen = .5;
    const minCelX = (window.innerWidth * minViewportDimen) / width;
    const minCelY = (window.innerHeight * minViewportDimen) / height;
    const minCelPx = Math.min(minCelX, minCelY);
    return minCelPx / scalar;
  }, [width, height, scalar]);

  const maxScale = useMemo(() => {
    const maxCelPx = 100;
    return maxCelPx / scalar;
  }, [scalar]);

  const clampScale = useCallback((val) => {
    let out = val
    if (val < minScale) {
      out = minScale;
    };
    if (val > maxScale) {
      out = maxScale;
    };
    return out.toFixed(2);
  }, [minScale, maxScale]);


  return {
    initialScale: (minScale + maxScale) / 2,
    clampScale,
  };
};








export default memo(function App({ mobile = false } = {}) {
  const params = useParams();
  const { width, height, colors } = params || {};

  const splashRef = useRef(null);
  const { ready, hasTouch, hasMouse } = useTouchDetect(splashRef);
  useTouchZoomOverride(hasTouch);


  const [activeColor, setActiveColor] = useState(6);
  const [cursorMode, setCursorMode] = useState(null);
  const windowRef = useRef(null);
  const touchRef = useRef(null);
  const canvasRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const oversamplePx = 4;
  const { gridStatus, scalar, clickCel } = useGrid({ params, activeColor, cursorMode, canvasRef, mapCanvasRef, oversamplePx });
  const { initialScale, clampScale } = useViewportScalar({ width, height, scalar });


  const handleClickColors = useCallback(e => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const color = +id.split('-')[1];
    setActiveColor(color);
  }, [setActiveColor]);


  const [zoomActive, setZoomActive] = useState(null);
  const [scale, setScale] = useState(1);
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(null);
  const prevZoom = useRef(zoom);


  const storeCenter = useCallback(() => {
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);


  const updateZoom = useCallback((zoomIn) => {
    const newZoom = clampScale(zoom * (zoomIn ? 1.2 : 0.8));
    if (newZoom) {
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoom, clampScale, storeCenter]);


  const handleClickCursors = useCallback(e => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const [setting, value] = id.split('-');
    if (setting === 'cursor') {
      return setCursorMode(value);
    };
    if (setting === 'zoom') {
      return updateZoom(+value);
    };
  }, [setCursorMode, updateZoom]);


  useEffect(() => {
    if (ready && !cursorMode) {
      setCursorMode(hasTouch ? 'paint' : 'drag');
    };
  }, [ready, hasTouch, cursorMode, setCursorMode]);




  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (el) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      const targetX = scrollWidth * x - (clientWidth / 2);
      const targetY = scrollHeight * y - (clientHeight / 2);
      const deltaX = targetX - scrollLeft;
      const deltaY = targetY - scrollTop;
      el.scrollBy(deltaX, deltaY);
    };
  }, [windowRef]);


  // const storeCenter = useCallback(() => {
  //   const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
  //   const x = (scrollLeft + clientWidth / 2) / scrollWidth;
  //   const y = (scrollTop + clientHeight / 2) / scrollHeight;
  //   setCenter([x, y]);
  // }, [windowRef, setCenter]);



  useEffect(() => {
    if (initialScale && !zoom) {

      // const paddedRandom = () => (Math.random() / 2) + .2;
      const paddedRandom = () => (Math.random() + 1) * .5;

      setZoom(initialScale);
      const zoomTarget = [paddedRandom(), paddedRandom()];
      // console.log(zoomTarget)
      panWindow(...zoomTarget);
    };
  }, [initialScale, zoom, setZoom, panWindow])







  const __handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    if (targetTouches.length !== 2) {
      return setZoomActive(false);
    };
    e.preventDefault();
    prevZoom.current = zoom;

    storeCenter();
    setZoomActive(true);
  }, [setZoomActive, prevZoom, zoom, storeCenter]);


  const __handleTouchMove = useCallback(e => {
    if (!zoomActive) {
      return null;
    };
    const { scale, targetTouches } = e;
    if (!scale || targetTouches.length !== 2) {
      e.stopPropagation();
      return setZoomActive(false);
    };
    e.preventDefault();
    setScale(scale);
  }, [zoomActive, setZoomActive, setScale]);





  const makeNewCenter = useCallback((t1, t2) => {
    const el = windowRef.current;
    if (!el) return null;

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = el;
    const tX = ((t1.clientX + t2.clientX) / 2);
    const tY = ((t1.clientY + t2.clientY) / 2);
    const x = (scrollLeft + tX) / scrollWidth;
    const y = (scrollTop + tY) / scrollHeight;



    setCenter([x, y, t1.clientX, t1.clientY])
  }, [windowRef, setCenter])






  const handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    if (targetTouches.length !== 2) {
      return setZoomActive(false);
    };
    e.preventDefault();
    prevZoom.current = zoom;


    makeNewCenter(targetTouches[0], targetTouches[1]);
    // storeCenter();
    setZoomActive(true);
  }, [setZoomActive, prevZoom, zoom, makeNewCenter]);



  const handleTouchMove = useCallback(e => {
    const { scale, targetTouches } = e;
    if (!scale || targetTouches.length !== 2) {
      e.stopPropagation();
      return setZoomActive(false);
    };
    if (!zoomActive) {
      return null;
    };
    e.preventDefault();
    // setZoomActive(true)
    setScale(scale);
  }, [zoomActive, setZoomActive, setScale]);


  const handleTouchEnd = useCallback(e => {
    const { touches } = e;
    setCenter(null);
    setZoomActive(touches.length === 2);
  }, [setZoomActive, setCenter]);



  // useEffect(() => {
  //   const el = windowRef.current;
  //   if (el && zoomActive) {
  //     el.addEventListener('touchmove', handleTouchMove, { passive: true });
  //     el.addEventListener('touchend', handleTouchEnd, { passive: true });
  //     el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  //   };
  //   return () => {
  //     if (el) {
  //       el.removeEventListener('touchmove', handleTouchMove);
  //       el.removeEventListener('touchend', handleTouchEnd);
  //       el.removeEventListener('touchcancel', handleTouchEnd);
  //     };
  //   };
  // }, [windowRef, zoomActive, handleTouchMove, handleTouchEnd]);


  useEffect(() => {
    const el = touchRef.current;
    if (el && zoomActive) {
      el.addEventListener('touchmove', handleTouchMove, { passive: true });
      el.addEventListener('touchend', handleTouchEnd, { passive: true });
      el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    };
    return () => {
      if (el) {
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        el.removeEventListener('touchcancel', handleTouchEnd);
      };
    };
  }, [touchRef, zoomActive, handleTouchMove, handleTouchEnd]);



  useEffect(() => {
    if (!zoomActive) {
      prevZoom.current = zoom;
      setCenter(null);
      setScale(1);
    };
    if (zoomActive) {
      const newZoom = clampScale((prevZoom.current * scale));
      if (newZoom) {
        storeCenter();
        setZoom(newZoom);
      };
    };
  }, [zoomActive, prevZoom, clampScale, zoom, setZoom, scale, setScale, storeCenter, setCenter]);



  useLayoutEffect(() => {   // recenter window
    // if (zoomActive && center) {
    if (center) {
      panWindow(...center);
    };
  }, [zoomActive, center, panWindow]);





  return (
    <div id="App">
      {!ready && (
        <div
          className={'Splash' + (gridStatus ? ' ready' : '')}
          ref={splashRef}
        >
          <h1>PxCels by<br />Kozak</h1>
          {gridStatus && (<h2>Click to<br />continue.</h2>)}
        </div>
      )}

      <Grid
        windowRef={windowRef}
        canvasRef={canvasRef}
        touchRef={touchRef}
        cursorMode={cursorMode}
        width={width}
        height={height}
        scalar={scalar}
        zoom={zoom}
        clickCel={clickCel}
        touchStart={handleTouchStart}
      />
      <div className="Toolbar">
        <div className="Toolbar--toolbox left">
          <Colors
            palette={colors}
            activeColor={activeColor}
            setColor={handleClickColors}
          />
          {hasMouse && (
            <Cursors
              cursorMode={cursorMode}
              click={handleClickCursors}
            />
          )}
        </div>
        <div className="Toolbar--toolbox right">
          <Minimap
            canvasRef={mapCanvasRef}
            windowRef={windowRef}
            gridRef={touchRef}
            pan={panWindow}
          />
      {/*
      */}
        </div>

      </div>


      {/*
        <User
          username={username !== 'anonymous' ? username : ''}
          post={postUsername}
        />
      */}
    </div>
  );
});
