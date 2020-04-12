import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import './Minimap.css';
import { parse } from '../../libs';





export default memo(function Minimap({ canvasRef = null, windowRef = null, gridRef = null, pan = null } = {}) {
  const [bigMap, setBigMap] = useState(false);
  const [panning, setPanning] = useState(false);
  const viewboxRef = useRef(null);


  const activateMap = useCallback(() => {
    if (bigMap) {
      return null;
    };
    if (windowRef.current && gridRef.current) {
      setBigMap(true);
    };
  }, [windowRef, gridRef, bigMap, setBigMap]);

  const disableMap = useCallback(e => {
    setBigMap(false);
    setPanning(false);
  }, [setBigMap, setPanning]);


  const positionViewbox = useCallback(() => {
    const elWindow = windowRef.current;
    const elGrid = gridRef.current;
    const elViewer = viewboxRef.current;
    if (!elWindow || !elGrid || !elViewer) {
      return null;
    };

    const viewboxWidth = elWindow.clientWidth / elGrid.clientHeight;
    const viewboxHeight = elWindow.clientHeight / elGrid.clientHeight;
    const viewboxLeft = (elWindow.scrollLeft - elGrid.offsetLeft) / elGrid.clientWidth;
    const viewboxTop = (elWindow.scrollTop - elGrid.offsetTop) / elGrid.clientHeight;

    const { style } = elViewer;
    style.left = parse.pct(viewboxLeft);
    style.top = parse.pct(viewboxTop);
    style.width = parse.pct(viewboxWidth);
    style.height = parse.pct(viewboxHeight);
  }, [windowRef, gridRef, viewboxRef]);


  useEffect(() => {   // redraw viewbox
    const el = windowRef.current;
    if (el) {
      el.addEventListener('scroll', positionViewbox, { passive: true });
      window.addEventListener('resize', positionViewbox, { passive: true });
    };

    return () => {
      if (el) {
        el.removeEventListener('scroll', positionViewbox);
        window.removeEventListener('resize', positionViewbox);
      };
    };
  }, [windowRef, positionViewbox]);


  const handlePan = useCallback((x, y) => {
    const { left, top, width, height } = canvasRef.current.getBoundingClientRect();
    const relX = (x - left) / width;
    const relY = (y - top) / height;
    pan(relX, relY);
  }, [canvasRef, pan])


  const handleMouseMove = useCallback(e => {
    const { clientX, clientY } = e;
    handlePan(clientX, clientY);
  }, [handlePan]);

  const handleTouchMove = useCallback(e => {
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    handlePan(clientX, clientY);
  }, [handlePan]);


  const handleMouseDown = useCallback(e => {
    setPanning(true);
    const { clientX, clientY } = e;
    handlePan(clientX, clientY);
  }, [setPanning, handlePan]);

  const handleTouchStart = useCallback(e => {
    setPanning(true);
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    handlePan(clientX, clientY);
  }, [setPanning, handlePan]);


  const disablePanning = useCallback(e => {
    setPanning(false);
  }, [setPanning]);


  useEffect(() => {
    if (panning) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', disablePanning);
      window.addEventListener('touchcancel', disablePanning);
      window.addEventListener('touchend', disablePanning);
    };
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', disablePanning);
      window.removeEventListener('touchcancel', disablePanning);
      window.removeEventListener('touchend', disablePanning);
    };
  }, [panning, handleMouseMove, disablePanning]);



  return (
    <div className="Tool--wrap Minimap">
      <div
        className={'Minimap--interceptor' + (!bigMap ? ' disabled' : '')}
        onClick={disableMap}
      />
      <div className="Tool Minimap--inner">
        <div className="Minimap--togglebox" onClick={activateMap}>
          <div className={'Minimap--mapbox' + (!bigMap ? ' small' : '')}>
            <canvas className="Minimap--map" ref={canvasRef} />
            <div className="Minimap--overlay"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onMouseDown={handleMouseDown}
            >
              <div className="Minimap--overlay-viewbox" ref={viewboxRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
