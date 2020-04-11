import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import './Grid.css';





export default memo(function Grid({ gridRef, cursorMode, width, height, celScale } = {}) {
  const [drag, setDrag] = useState(false);
  const dragBoxRef = useRef(null);


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
    const el = dragBoxRef.current;
    el.scrollBy(-e.movementX, -e.movementY);
  }, [dragBoxRef]);


  useEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [drag, handleDragMove, handleDragEnd]);



  const celboxStyle = {
    gridTemplateColumns: `repeat(${width}, ${celScale}px)`,
    gridTemplateRows: `repeat(${height}, ${celScale}px)`,
    // gridAutoColumns: `${celScale}px`,
    // gridAutoRows: `${celScale}px`,
    gridGap: (celScale < 10) ? '0px' : '1px',
    cursor: cursorMode === 'paint'
      ? 'crosshair'
      : (drag ? 'grabbing, grab' : 'grab'),
  };


  return (
    <div
      className="Grid--wrap"
      ref={dragBoxRef}
      onMouseDown={handleDragStart}
    >
      <div className="Grid--flex">
        <div
          className="Grid--celbox"
          ref={gridRef}
          style={celboxStyle}
        >
        </div>
      </div>
    </div>
  );
});





          // <CelRender {...celView} />


          // {rows}

          // <CelRender {...celView} />

