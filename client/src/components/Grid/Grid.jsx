import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import './Grid.css';





export default memo(function Grid({ gridRef, dimen = {} } = {}) {
  const { width, height } = dimen;
  const [celScale, setCelScale] = useState(30);
  const celScaleRange = [5, 50];


  const handleZoom = useCallback((e) => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const zoomIn = +id.split('-')[1];
    const increment = Math.floor(Math.max(celScale / 5, 1));

    const [min, max] = celScaleRange;
    let newCelScale = celScale + (zoomIn ? increment : -increment);
    if (newCelScale >= max) {
      newCelScale = max;
    };
    if (newCelScale < min) {
      newCelScale = min;
    };

    setCelScale(newCelScale);
  }, [celScaleRange, celScale, setCelScale]);



  const [drag, setDrag] = useState(false);
  const dragBoxRef = useRef(null);


  const handleDragStart = useCallback(e => {
    setDrag(true);
  }, [setDrag]);


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



  const gridStyle = {
    gridTemplateColumns: `repeat(${width}, ${celScale}px)`,
    gridTemplateRows: `repeat(${height}, ${celScale}px)`,
    gridGap: (celScale < 10) ? '0px' : '1px',
  };


  return (
    <div className="Grid">
      <div className="Grid--zoom" onClick={handleZoom}>
        <div id="zoom-1" className="Grid--zoom-button">
          <h2>+</h2>
        </div>
        <div id="zoom-0" className="Grid--zoom-button">
          <h2>−</h2>
        </div>
      </div>
      <div
        className="Grid--wrap"
        ref={dragBoxRef}
        onMouseDown={handleDragStart}
        // onMouseUp={handleDragEnd}
        // onMouseLeave={handleDragEnd}
      >
        <div className="Grid--flex">
          <div
            className="Grid--celbox"
            ref={gridRef}
            style={gridStyle}
          />
        </div>
      </div>
    </div>
  );
});
