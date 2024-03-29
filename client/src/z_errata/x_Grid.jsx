import React, { memo, useState, useEffect, useCallback } from 'react';
import './Grid.css';





export default memo(function Grid({ windowRef, gridRef, cursorMode, width, height, celScale } = {}) {
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



  const gridStyle = {
    gridTemplateColumns: `repeat(${width}, ${celScale}px)`,
    gridTemplateRows: `repeat(${height}, ${celScale}px)`,
    gridGap: (celScale < 10) ? '0px' : '1px',
    cursor: cursorMode === 'paint'
      ? 'crosshair'
      : (drag ? 'move' : 'grab'),
  };



  return (
    <div
      className="Grid--window"
      ref={windowRef}
      onMouseDown={handleDragStart}
    >
      <div className="Grid--flex-wrap">
        <div className="Grid--wrap">
          <div
            className="Grid"
            ref={gridRef}
            style={gridStyle}
          />
        </div>
      </div>
    </div>
  );
});
