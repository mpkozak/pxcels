import React, { memo, useState, useEffect, useMemo, useLayoutEffect, useRef, useCallback } from 'react';
import './App2.css';
import { useSocket, useParams } from './hooks';
import { Grid, Colors, Cursors, Minimap } from './components';
// import User from './User.jsx';







function useTouchDetect() {
  // const [touch, setTouch] = useState(localStorage.getItem('touch_device'));
  // const [mouse, setMouse] = useState(localStorage.getItem('mouse_device'));


  const [touch, setTouch] = useState(false);
  const [mouse, setMouse] = useState(false);


  console.log('touch detect ran')

  const handleTouch = useCallback(e => {
    console.log('touch event', e)
    setTouch(true);
    localStorage.setItem('touch_device', true);
  }, [setTouch]);



  const handleMouse = useCallback(e => {
    console.log('mouse event', e)
    setMouse(true);
    localStorage.setItem('mouse_device', true);
  }, [setMouse]);


  useEffect(() => {
    console.log("effect ran")
    if (!touch && !mouse) {
    console.log("listeners added")
      document.addEventListener('mousemove', handleMouse);
      document.addEventListener('touchstart', handleTouch);
    };
    return () => {
      console.log("listeners removed")
      document.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('touchstart', handleTouch);
    }
  }, [touch, mouse, handleTouch, handleMouse]);

  useTouchZoomOverride();

  return touch ? 'touch' : (mouse ? 'mouse' : '');
};









function useTouchZoomOverride() {
  useEffect(() => {
    // const cancelTouch = e => e.preventDefault();
    const cancelTouch = e => {
      if (e.touches.length === 2) {
        e.preventDefault();
      };
    };
    window.addEventListener('touchmove', cancelTouch, { passive: false });
  }, []);
};















function useGrid({ params, canvasRef} = {}) {

  const [redrawFlag, setRedrawFlag] = useState(false);
  const [celQueue, setCelQueue] = useState(null);
  const [lastDraw, setLastDraw] = useState(0);
  const dataRef = useRef(null);


  const handleUpdateGrid = useCallback(newGrid => {
    dataRef.current = newGrid;
    setRedrawFlag(true);
  }, [dataRef, setRedrawFlag]);


  const handleUpdateCel = useCallback(newCel => {
    const { _id, current } = newCel;
    const cel = dataRef.current[_id];
    cel.current = current;
    setCelQueue(cel);
  }, [dataRef, setCelQueue]);


  const handleUpdateLastDraw = useCallback(timestamp => {
    setLastDraw(timestamp);
  }, [setLastDraw]);


  const handleSocketMessage = useCallback(({ type, payload }) => {
    switch (type) {
      case 'update_grid':
        handleUpdateGrid(payload);
        break;
      case 'update_cel':
        handleUpdateCel(payload);
        break;
      case 'update_last_draw':
        handleUpdateLastDraw(payload);
        break;
      default:
        console.log('Socket --- Unhandled Message in useGrid:', type, payload);
        return null;
    };
  }, [handleUpdateGrid, handleUpdateCel, handleUpdateLastDraw]);



  const { active, post, username, postUsername } = useSocket(handleSocketMessage);


  useEffect(() => {   // get grid data from socket
    if (params && active && !dataRef.current) {
      post('get_grid');
    };
  }, [dataRef, params, active, post]);



  const ctx = useRef(null);
  // const scale = memo(() => window.devicePixelRatio * 4);
  const scale = window.devicePixelRatio * 4;
  // const offCanvas = useRef(null);
  // const offCtx = useRef(null);


  useEffect(() => {   // set the onscreen canvas dimensions to match its display size; get context
    const canvas = canvasRef.current;
    if (params && canvas && !ctx.current) {
      const { width, height } = params;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.current = canvas.getContext('2d');
      // ctx.current.imageSmoothingEnabled = false;
      ctx.current.scale(scale, scale);
    };
  }, [params, canvasRef, ctx, scale]);


  // useEffect(() => {   // create offscreen rendering canvas
  //   if (params && !offCanvas.current) {
  //     const { width, height } = params;
  //     const par = window.devicePixelRatio;
  //     const targetW = width * par;
  //     const targetH = height * par;
  //     if (typeof OffscreenCanvas !== 'undefined') {
  //       offCanvas.current = new OffscreenCanvas(targetW, targetH);
  //     } else {
  //       offCanvas.current = document.createElement('canvas');
  //       offCanvas.current.width = targetW;
  //       offCanvas.current.height = targetH;
  //     };
  //     offCtx.current = offCanvas.current.getContext('2d');
  //     offCtx.current.scale(par, par);
  //   };
  // }, [params, offCanvas, offCtx]);



  const readymades = useMemo(() => {
    if (!params) return null;
    const { colors } = params;
    const colorSquares = colors.map(d => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = d;
      ctx.fillRect(0, 0, 1, 1)
      return canvas;
    });
    return colorSquares;
  }, [params]);


  const drawCanvas = useCallback(() => {
    const { colors } = params;
    const data = dataRef.current;
    if (!data || !colors) return null;

    const cx = ctx.current;
    // cx.imageSmoothingEnabled = false;
    data.forEach(d => {
      const { row, col, current: { color } } = d;
      cx.fillStyle = colors[color];
      cx.fillRect(col, row, 1, 1);
    });
  }, [params, dataRef, ctx]);




  // const drawCanvas = useCallback(() => {
  //   const data = dataRef.current;
  //   if (!data) return null;

  //   const offCx = offCtx.current;
  //   data.forEach(d => {
  //     const { row, col, current: { color } } = d;
  //     offCx.drawImage(readymades[color], col, row, 1, 1);
  //   });

  //   const cx = ctx.current;
  //   cx.drawImage(offCx.canvas, 0, 0, cx.canvas.width, cx.canvas.height);
  // }, [dataRef, readymades, offCtx, ctx]);


  useEffect(() => {   // draw canvas
    if ((redrawFlag || celQueue) && ctx.current) {
      drawCanvas();
    };
  }, [redrawFlag, celQueue, ctx, drawCanvas]);


  return { scalar: scale };


};






export default memo(function App({ mobile = false } = {}) {

  const inputDevice = useTouchDetect();

  const params = useParams();
  const { colors, width, height } = params || {};

  const canvasRef = useRef(null);

  const { scalar } = useGrid({ params, canvasRef });



  const windowRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const prevZoom = useRef(zoom);
  const [scale, setScale] = useState(1);




  const [zoomActive, setZoomActive] = useState(null);
  const [center, setCenter] = useState(null);

  const storeCenter = useCallback(() => {
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);


  // const panWindow = useCallback((x, y) => {
  //   const el = windowRef.current;
  //   if (el) {
  //     const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
  //     const targetX = scrollWidth * x - clientWidth / 2;
  //     const targetY = scrollHeight * y - clientHeight / 2;
  //     const deltaX = targetX - scrollLeft;
  //     const deltaY = targetY - scrollTop;
  //     el.scrollBy(deltaX, deltaY);
  //   };
  // }, [windowRef]);


  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth * x;
      el.scrollTop = el.scrollHeight * y;
      // const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      // const targetX = scrollWidth * x - clientWidth / 2;
      // const targetY = scrollHeight * y - clientHeight / 2;
      // const deltaX = targetX - scrollLeft;
      // const deltaY = targetY - scrollTop;
      // el.scrollBy(deltaX, deltaY);
    };
  }, [windowRef]);


  const handleTouchStart = useCallback(e => {
    const { touches } = e;
    if (touches.length !== 2) {
      return setZoomActive(false);
    };
    e.preventDefault();
    prevZoom.current = zoom;
    storeCenter();
    setZoomActive(true);
  }, [setZoomActive, prevZoom, zoom, storeCenter]);


  const handleTouchMove = useCallback(e => {
    const { scale, touches } = e;
    if (!scale || touches.length !== 2) {
      e.stopPropagation();
      return setZoomActive(false);
    };
    if (!zoomActive) {
      return null;
    };
    e.preventDefault();
    setScale(scale);
  }, [zoomActive, setZoomActive, setScale]);


  const handleTouchEnd = useCallback(e => {
    const { touches } = e;
    setZoomActive(touches.length === 2);
    // storeCenter(null);
    // setScale(1);
    // prevZoom.current = zoom;
    // if (touches.length = 2) {
    //   return null;
    // };
  }, [setZoomActive]);



  useLayoutEffect(() => {
    const el = windowRef.current;
    if (el && zoomActive && center) {
      const [x, y] = center;
      const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      const targetX = scrollWidth * x - clientWidth / 2;
      const targetY = scrollHeight * y - clientHeight / 2;
      const deltaX = targetX - scrollLeft;
      const deltaY = targetY - scrollTop;
      el.scrollBy(deltaX, deltaY);
    };
  }, [zoomActive, center, windowRef]);


  useEffect(() => {
    if (!zoomActive) {
      prevZoom.current = zoom;
      setCenter(null);
      setScale(1);
    };
    if (zoomActive) {
      // const newZoom = prevZoom.current * scale;
      const newZoom = (prevZoom.current * scale).toFixed(2);
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoomActive, prevZoom, zoom, setZoom, scale, setScale, storeCenter, setCenter]);


  useEffect(() => {
    const el = windowRef.current;
    if (el && zoomActive) {
      el.addEventListener('touchmove', handleTouchMove, { passive: true });
      el.addEventListener('touchend', handleTouchEnd, { passive: true });
      el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    };
    return () => {
      if (el) {
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        el.removeEventListener('touchcancel', handleTouchEnd);
      };
    };
  }, [windowRef, zoomActive, handleTouchMove, handleTouchEnd]);





  // useEffect(() => {
  //   if (zoomActive) {
  //     const newZoom = prevZoom.current * scale;
  //     setZoom(newZoom);
  //   };
  // }, [zoomActive, scale, prevZoom, setZoom]);









  // useEffect(() => {
  //   if (zoomActive && center) {
  //     panWindow(...center);
  //     // setCenter(null);
  //   };
  // }, [zoomActive, center, setCenter, panWindow]);








  return (
    <div id="App" className={inputDevice} >

      <div
        className="Grid--window"
        ref={windowRef}
        style={{ backgroundColor: !zoomActive ? '' : 'blue' }}
        onTouchStart={handleTouchStart}
        // onMouseDown={handleDragStart}
      >
        <div className="Grid--flex-wrap">
          <div className="Grid--wrap">
            <div
              className="Grid--canvas-wrap"
              style={{
                width: scalar * width * zoom + 'px',
                height: scalar * height * zoom + 'px',
              }}
            >
              <canvas
                className="Grid"
                style={{
                  transform: `scale(${zoom})`,
                  // imageRendering: '-webkit-optimize-contrast',
                  imageRendering: 'pixelated',
                }}
                ref={canvasRef}
              />
            </div>
          </div>
        </div>
      </div>

      <div id="Anchor">
        {zoom}<br />
        {center ? `${center[0]}\n${center[1]}` : 'no center'}
      </div>
    </div>
  );
});

      // {!inputDevice && (
      //   <div className="Welcome">
      //     <h1>input device is:</h1>
      //     <h3>{inputDevice}</h3>
      //   </div>
      // )}

      //   <h1>{scale}</h1>



        // <div
        //   id="Canvas--wrap"
        //   style={{
        //     width: width * zoom + 'px',
        //     height: height * zoom + 'px',
        //   }}
        // >
        //   <canvas
        //     id="Canvas"
        //     ref={canvasRef}
        //     style={{
        //       // width: width + 'px',
        //       // height: height + 'px',
        //       transform: `scale(${zoom})`
        //     }}
        //   />
        // </div>













