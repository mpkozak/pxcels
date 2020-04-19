import React, {
  Fragment,
  createContext,
  memo,
  useContext,
  useRef,
  useMemo,
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import './Grid.css'
// import { cl } from '../../libs';
import {
  GridCanvas,
  GridLines,
  GridWindow,
} from './';





export default memo(function Grid({
  uiMode = 0,
  cursorMode = 0,
  windowRef = null,
  canvasRef = null,
  paintCel = null,
  scalar = 1,
  zoom = 1,

  gridRef,
  width,
  height,
  // cursorMode,
  touchStart = null,
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
      <div
        className="Grid"
        ref={gridRef}
        style={gridStyle}
        onTouchStart={touchStart}
        // onTouchMove={handleTouchMove}
        // onTouchEnd={handleTouchEnd}
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
      </div>
    </GridWindow>
  );
});




        // <canvas className="Grid__canvas"
        //   ref={gridCanvasRef}
        //   style={gridCanvasStyle}
        //   onClick={handleClickCel}
        // />
        //
