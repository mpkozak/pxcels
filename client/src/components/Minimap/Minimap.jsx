import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import './Minimap.css';




function clampPct(val) {
  return Math.floor(val * 100) + '%';
};



export default memo(function Minimap({ canvasRef = null, windowRef = null, pan = null } = {}) {
  const [bigMap, setBigMap] = useState(false);
  const [panning, setPanning] = useState(false);
  const viewboxRef = useRef(null);





  const toggleMap = useCallback(e => {
    setBigMap(!bigMap);
    // setBigMap(true);
  }, [bigMap, setBigMap]);


  const togglePanning = useCallback(e => {
    // e.stopPropagation();
    setPanning(!panning);
  }, [panning, setPanning]);


  const positionViewbox = useCallback(() => {
    const elWindow = windowRef.current;
    const elViewer = viewboxRef.current;
    if (elWindow && elViewer) {
      const { clientWidth, clientHeight, scrollWidth, scrollHeight, scrollLeft, scrollTop } = elWindow;
      const x = scrollLeft / scrollWidth;
      const y = scrollTop / scrollHeight;
      const w = clientWidth / scrollWidth;
      const h = clientHeight / scrollHeight;

      const { style } = elViewer;
      style.left = clampPct(x);
      style.top = clampPct(y);
      style.width = clampPct(w);
      style.height = clampPct(h);
    };
  }, [windowRef, viewboxRef]);



  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY, target } = e;
    console.log("mousemove", clientX, clientY)
    const { left, top, width, height } = canvasRef.current.getBoundingClientRect();
    const relX = (clientX - left) / width;
    const relY = (clientY - top) / height;
    positionViewbox();
    pan(relX, relY);
  }, [canvasRef, positionViewbox, pan]);





  const handleMouseUp = useCallback(e => {
    setPanning(false);
  }, [setPanning]);




  useEffect(() => {
    if (bigMap) {
      positionViewbox();
    };
  }, [bigMap, positionViewbox]);


  useEffect(() => {
    console.log("panning effect")
    if (panning) {
      console.log('add mousemve')
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp)
    };
    return () => {
      console.log('remove mousemve')
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panning, handleMouseMove, handleMouseUp]);







  const handlePan = useCallback(e => {



  })




  const handleClickMap = useCallback(e => {
    if (bigMap) {
      const { clientX, clientY, target } = e;
      const { left, top, width, height } = target.getBoundingClientRect();
      const relX = (clientX - left) / width;
      const relY = (clientY - top) / height;
      pan(relX, relY)

      // console.log(relX, relY)
      // return
    }
    setBigMap(!bigMap);
  }, [bigMap, setBigMap, pan]);




  // useEffect(() => {
  //   const elWindow = windowRef.current;
  //   const elViewer = viewboxRef.current;
  //   if (elWindow && elViewer) {

  //     const { clientWidth, clientHeight, scrollWidth, scrollHeight, scrollLeft, scrollTop } = elWindow;
  //     const w = clientWidth / scrollWidth;
  //     const h = clientHeight / scrollHeight;

  //     console.log('w, h', w, h)

  //     // console.log(clientWidth, clientHeight, scrollLeft, scrollTop )
  //   }
  // }, [windowRef, viewboxRef])





  return (
    <div className="Tool--wrap Minimap">
      <div className="Tool Minimap--inner">
        <div className="Minimap--mapbox" onClick={toggleMap}>
          <canvas
            className={'Minimap--map' + (!bigMap ? ' small' : '')}
            ref={canvasRef}
            // onClick={handleClickMap}
          />
          <div className={'Minimap--viewbox' + (!bigMap ? ' hide' : '')}>
            <div
              className="Minimap--viewbox-window"
              ref={viewboxRef}
              onMouseDown={togglePanning}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
