import React, {
  memo,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import './Grid.css';
import GridLines from './GridLines.jsx';





export default memo(function Grid({
  windowRef,
  touchRef,
  gridCanvasRef,
  width,
  height,
  scalar,
  zoom,
  cursorMode,
  clickCel = null,
  touchStart = null,
} = {}) {

  const baseWidth = useMemo(() => scalar * width, [scalar, width]);
  const baseHeight = useMemo(() => scalar * height, [scalar, height]);
  const pxWidth = useMemo(() => baseWidth * zoom, [baseWidth, zoom]);
  const pxHeight = useMemo(() => baseHeight * zoom, [baseHeight, zoom]);

  const [drag, setDrag] = useState(false);


/*
    TOUCH EVENTS
*/









/*
    MOUSE EVENTS
*/


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




  const gridStyle = useMemo(() => ({
    width: pxWidth + 'px',
    height: pxHeight + 'px',
  }), [pxWidth, pxHeight]);

  const gridCanvasStyle = useMemo(() => ({
    transform: `scale(${zoom})`,
    cursor: cursorMode === 'paint'
      ? 'crosshair'
      : (drag ? 'move' : 'grab'),
  }), [zoom, cursorMode, drag]);


  return (
    <div className="Grid--window"
      ref={windowRef}
      onMouseDown={handleDragStart}
    >
      <div className="Grid--flex-wrap">
        <div className="Grid--flex">
          <div className="Grid"
            ref={touchRef}
            style={gridStyle}
            onTouchStart={touchStart}
            // onTouchMove={handleTouchMove}
            // onTouchEnd={handleTouchEnd}
          >
            <canvas className="Grid--canvas"
              ref={gridCanvasRef}
              style={gridCanvasStyle}
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
