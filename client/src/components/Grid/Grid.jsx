import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  // useRef,
  useMemo,
  useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import './Grid.css'
import {
  GridCanvas,
  GridLines,
  GridWindow,
  GridZoom,
} from './';





export default memo(function Grid({
  uiMode = 0,
  cursorMode = 0,
  gridRef = null,
  windowRef = null,
  canvasRef = null,
  paintCel = null,
  width = 0,
  height = 0,
  scalar = 1,
  zoom = 1,
  setZoom = null,
  calcZoom = null,
  storeCenter = null,
} = {}) {


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
// Touch Zoom
///////////////////////////////////////

  // const [zoomActive, setZoomActive] = useState(null);
  // const [scale, setScale] = useState(1);
  // const prevZoom = useRef(null);


  // const handleTouchStart = useCallback(e => {
  //   const { targetTouches } = e;
  //   if (targetTouches.length !== 2) {
  //     return setZoomActive(false);
  //   };
  //   e.preventDefault();
  //   prevZoom.current = zoom;
  //   storeCenter();
  //   setZoomActive(true);
  // }, [setZoomActive, prevZoom, zoom, storeCenter]);


  // const handleTouchMove = useCallback(e => {
  //   const { scale, targetTouches } = e;
  //   if (!scale || targetTouches.length !== 2) {
  //     // e.stopPropagation();
  //     return setZoomActive(false);
  //   };
  //   if (!zoomActive) {
  //     return null;
  //   };
  //   e.preventDefault();
  //   storeCenter();
  //   setScale(scale);
  // }, [setZoomActive, zoomActive, storeCenter, setScale]);


  // const handleTouchEnd = useCallback(e => {
  //   storeCenter(true);
  //   setZoomActive(false);
  // }, [storeCenter, setZoomActive]);


  // useEffect(() => {
  //   const el = gridRef.current;
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
  // }, [gridRef, zoomActive, handleTouchMove, handleTouchEnd]);


  // useEffect(() => {
  //   if (!zoomActive) {
  //     prevZoom.current = zoom;
  //     storeCenter(true);
  //     setScale(1);
  //   };
  //   if (zoomActive) {
  //     const newZoom = calcZoom(prevZoom.current * scale);
  //     if (newZoom) {
  //       storeCenter();
  //       setZoom(newZoom);
  //     };
  //   };
  // }, [zoomActive, prevZoom, storeCenter, scale, setScale, calcZoom, zoom, setZoom]);



///////////////////////////////////////
// Painting
///////////////////////////////////////

  const handlePaintCel = useCallback(e => {
    if (cursorMode !== 1) return null;
    const { clientX, clientY } = e;
    const { x, y } = e.target.getBoundingClientRect();
    const cX = Math.floor((clientX - x) / gridRatio);
    const cY = Math.floor((clientY - y) / gridRatio);
    paintCel(cX, cY);
  }, [cursorMode, gridRatio, paintCel]);



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
        uiMode={uiMode}
        gridRef={gridRef}
        gridStyle={gridStyle}
        zoom={zoom}
        setZoom={setZoom}
        calcZoom={calcZoom}
        storeCenter={storeCenter}
      >
        <GridCanvas
          canvasRef={canvasRef}
          canvasStyle={canvasStyle}
          paintCel={handlePaintCel}
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
