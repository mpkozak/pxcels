import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import './Grid.css';





export default memo(function Grid({ gridRef, dimen = {}, cursorMode } = {}) {
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
    gridGap: (celScale < 10) ? '0px' : '1px',
    cursor: cursorMode === 'paint'
      ? 'crosshair'
      : (drag ? 'grabbing, grab' : 'grab'),
  };


  return (
    <div className="Grid">
      <div className="Grid--zoom" onClick={handleZoom}>
        <div id="zoom-1" className="Grid--zoom-button button">
          <h2>+</h2>
        </div>
        <div id="zoom-0" className="Grid--zoom-button button">
          <h2>−</h2>
        </div>
      </div>
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
          />
        </div>
      </div>
    </div>
  );
});
