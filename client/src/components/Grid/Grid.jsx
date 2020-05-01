import React, {
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import './Grid.css';
import { useGlobalContext } from '../../hooks';
import {
  GridCanvas,
  GridLines,
  GridWindow,
  GridZoom,
} from './';





export default memo(function Grid({
  gridRef = null,
  windowRef = null,
  gridCanvasRef = null,
  cursorMode = 0,
  paintCel = null,
  showTooltip = null,
  zoom = 1,
  zoomListeners = {},
} = {}) {


  const [context] = useGlobalContext();
  const {
    width,
    height,
    scalar,
    uiMode,
  } = context;


  const gridRatio = useMemo(() => scalar * zoom, [scalar, zoom]);
  const pxWidth = useMemo(() => width * gridRatio, [width, gridRatio]);
  const pxHeight = useMemo(() => height * gridRatio, [height, gridRatio]);



///////////////////////////////////////
// Mouse Drag
///////////////////////////////////////

  const [dragging, setDragging] = useState(false);


  const startDragging = useCallback(e => {
    if (cursorMode !== 0) return null;
    setDragging(true);
  }, [cursorMode, setDragging]);


  const stopDragging = useCallback(e => {
    setDragging(false);
  }, [setDragging]);


  const dragWindow = useCallback(e => {
    const el = windowRef.current;
    el.scrollBy(-e.movementX, -e.movementY);
  }, [windowRef]);


  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', dragWindow);
      window.addEventListener('mouseup', stopDragging);
    } else {
      window.removeEventListener('mousemove', dragWindow);
      window.removeEventListener('mouseup', stopDragging);
    };
  }, [dragging, dragWindow, stopDragging]);



///////////////////////////////////////
// Position Helper
///////////////////////////////////////

  const getCelCoords = useCallback(e => {
    const { clientX, clientY, target } = e;
    const { x, y } = target.getBoundingClientRect();
    const cX = Math.floor((clientX - x) / gridRatio);
    const cY = Math.floor((clientY - y) / gridRatio);
    return { cX, cY, clientX, clientY };
  }, [gridRatio]);



///////////////////////////////////////
// Painting
///////////////////////////////////////

  const handlePaintCel = useCallback(e => {
    if (cursorMode !== 1 || (uiMode === 1 && gridRatio < 5)) return null;
    const { cX, cY } = getCelCoords(e);
    paintCel(cX, cY);
  }, [uiMode, cursorMode, gridRatio, getCelCoords, paintCel]);



///////////////////////////////////////
// Tooltip
///////////////////////////////////////

  const handleShowTooltip = useCallback(e => {
    if (uiMode !== 2 || cursorMode !== 1) return null;
    const { cX, cY, clientX, clientY } = getCelCoords(e);
    showTooltip(cX, cY, clientX, clientY);
  }, [uiMode, cursorMode, getCelCoords, showTooltip]);



///////////////////////////////////////
// Style Memos
///////////////////////////////////////

  const gridStyle = useMemo(() => ({
    width: pxWidth + 'px',
    height: pxHeight + 'px',
  }), [pxWidth, pxHeight]);


  const canvasStyle = useMemo(() => ({
    transform: `scale(${zoom})`,
    cursor: cursorMode
      ? 'crosshair'
      : (dragging ? 'move' : 'grab'),
  }), [zoom, cursorMode, dragging]);



  return (
    <GridWindow
      uiMode={uiMode}
      windowRef={windowRef}
      startDragging={startDragging}
    >
      <GridZoom
        gridRef={gridRef}
        gridStyle={gridStyle}
        zoomListeners={zoomListeners}
      >
        <GridCanvas
          canvasRef={gridCanvasRef}
          canvasStyle={canvasStyle}
          paintCel={handlePaintCel}
          showTooltip={handleShowTooltip}
        />
        <GridLines
          width={width}
          height={height}
          pxWidth={pxWidth}
          pxHeight={pxHeight}
          gridRatio={gridRatio}
        />
      </GridZoom>
    </GridWindow>
  );
});
