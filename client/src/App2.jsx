import React, { memo, useState, useEffect, useMemo, useLayoutEffect, useRef, useCallback } from 'react';
import './App2.css';
import { useParams, useTouchDetect, useTouchZoomOverride, useSocket,  } from './hooks';
import { Grid, Colors, Cursors, Minimap } from './components';
// import User from './User.jsx';



















function useGrid({ params, canvasRef, oversamplePx = 1 } = {}) {

  const [redrawGridFlag, setRedrawGridFlag] = useState(false);
  const [redrawCel, setRedrawCel] = useState(null);
  const [lastDraw, setLastDraw] = useState(0);
  const dataRef = useRef(null);



  const handleUpdateGrid = useCallback(newGrid => {
    dataRef.current = newGrid;
    setRedrawGridFlag(true);
  }, [dataRef, setRedrawGridFlag]);


  const handleUpdateCel = useCallback(newCel => {
    const { _id, current } = newCel;
    const cel = dataRef.current[_id];
    cel.current = current;
    setRedrawCel(cel);
  }, [dataRef, setRedrawCel]);


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
    if (active) {
      post('get_grid');
    };
  }, [active, post]);


  const scalar = useMemo(() => window.devicePixelRatio * oversamplePx, [oversamplePx]);

  const canvasColorSquares = useMemo(() => {
    if (!params) return null;
    const { colors } = params;
    const colorSquares = colors.map(d => {
      const scalar = 1;
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = d;
      ctx.fillRect(0, 0, 1, 1);
      return canvas;
    });
    return colorSquares;
  }, [params]);


  const ctx = useRef(null);
  const offCanvas = useRef(null);
  const offCtx = useRef(null);




  useEffect(() => {   // set the onscreen canvas dimensions to match its display size; get context; same for offscreen canvas
    const canvas = canvasRef.current;
    if (params && canvas && !ctx.current) {
      const { width, height } = params;
      const targetW = width * scalar;
      const targetH = height * scalar;

    // set main canvas
      canvas.width = targetW;
      canvas.height = targetH;
      // canvas.style.width = targetW / window.devicePixelRatio;
      // canvas.style.height = targetH / window.devicePixelRatio;

      // canvas.style.width = width + 'px';
      // canvas.style.height = height + 'px';

      ctx.current = canvas.getContext('2d');
      ctx.current.imageSmoothingEnabled = false;
      // ctx.current.scale(scalar, scalar);

    // set offscreen canvas
      if (typeof OffscreenCanvas !== 'undefined') {
        offCanvas.current = new OffscreenCanvas(targetW, targetH);
      } else {
        offCanvas.current = document.createElement('canvas');
        offCanvas.current.width = targetW;
        offCanvas.current.height = targetH;
      };
      offCtx.current = offCanvas.current.getContext('2d');
      offCtx.current.imageSmoothingEnabled = false;
      offCtx.current.scale(scalar, scalar);
    };
  }, [params, canvasRef, scalar, ctx, offCanvas, offCtx]);



  // const drawCanvas = useCallback(() => {
  //   const { colors } = params;
  //   const data = dataRef.current;
  //   if (!data || !colors) return null;

  //   const cx = ctx.current;
  //   data.forEach(d => {
  //     const { row, col, current: { color } } = d;
  //     cx.fillStyle = colors[color];
  //     cx.fillRect(col, row, 1, 1);
  //   });
  // }, [params, dataRef, ctx]);




  const drawCanvas = useCallback(() => {
    const data = dataRef.current;
    const cx = ctx.current;
    const offCx = offCtx.current;

    if (!data || !cx || !ctx) return null;

    data.forEach(d => {
      const { row, col, current: { color } } = d;
      offCx.drawImage(canvasColorSquares[color], col, row, 1, 1);
    });

    cx.drawImage(offCx.canvas, 0, 0, cx.canvas.width, cx.canvas.height);
    // cx.drawImage(offCx.canvas, 0, 0);

  }, [dataRef, canvasColorSquares, offCtx, ctx]);


  useEffect(() => {   // draw canvas
    if ((redrawGridFlag || redrawCel) && ctx.current && offCtx.current) {
      drawCanvas();
    };
  }, [redrawGridFlag, redrawCel, ctx, offCtx, drawCanvas]);


  return { scalar };


};





const GridLines = memo(({ width, height, pxWidth, pxHeight } = {}) => {

  const cols = useMemo(() => {
    return (new Array(1 + width).fill('')).map((d, i) =>
      <path key={`x${i}`} d={`M ${i} ${height} L ${i} 0`} />
    );
  }, [width, height]);

  const rows = useMemo(() => {
    return (new Array(1 + height).fill('')).map((d, i) =>
      <path key={`y${i}`} d={`M 0 ${i} L ${width} ${i}`} />
    );
  }, [width, height]);

  const strokeWidth = useMemo(() => {
    const sw = (width / pxWidth);
    if (isNaN(sw) || sw > .1) {
      return 0;
    };
    return sw;
  }, [width, pxWidth]);

  if (!strokeWidth) return null;

  return (
    <svg
      className="Grid--lines"
      width={pxWidth}
      height={pxHeight}
      viewBox={`0 0 ${width} ${height}`}
    >
      <g strokeWidth={strokeWidth}>
        {rows}
        {cols}
      </g>
    </svg>
  );
})







function useViewport({ width, height, scalar }) {

  // const canvasScalar = window.devicePixelRatio * 4;

  // const clampZoom =
  // const [minScale, setMinScale] = useState(null);
  // const [maxScale, setMaxScale] = useState(null);

  const minScale = useMemo(() => {
    const minViewportDimen = .5;
    const minCelX = (window.innerWidth * minViewportDimen) / width;
    const minCelY = (window.innerHeight * minViewportDimen) / height;
    const minCelPx = Math.min(minCelX, minCelY);
    return minCelPx / scalar;
  }, [width, height, scalar]);


  const maxScale = useMemo(() => {
    const maxCelPx = 100;
    return maxCelPx / scalar;
  }, [scalar]);


  // useEffect(() => {
  //   if (width && height && scalar && (!minScale || !maxScale)) {
  //   console.log('useviewport --- set Scale')
  //     const minGridDimen = .5;
  //     const minGridWidth = window.innerWidth * minGridDimen;
  //     const minGridHeight = window.innerHeight * minGridDimen;

  //     const minWidthOverBase = minGridWidth / width;
  //     const minHeightOverBase = minGridHeight / height;
  //     const minGridScale = Math.min(minWidthOverBase, minHeightOverBase);
  //     const maxGridScale = 100;

  //     // setMinScale(minGridScale / scalar);
  //     setMinScale(minGridScale / scalar);
  //     setMaxScale(maxGridScale / scalar);
  //   };
  // }, [minScale, setMinScale, maxScale, setMaxScale, width, height, scalar]);


  const clampZoom = useCallback((val) => {
    // if (!minScale || !maxScale) {
    //   return null;
    // };
    // alert('clampzoom');

    let out = val
    if (val < minScale) {
      out = minScale;
    };
    if (val > maxScale) {
      out = maxScale;
    };
    return out.toFixed(2);
  }, [minScale, maxScale]);

// alert(minScale)
  return {


    // initialZoom: (window.innerWidth / (width * scalar)) * .5,
    initialZoom: (minScale + maxScale) / 2,
    // minScale,
    clampZoom,
  };


};




    // console.log(minGridWidth, minGridHeight)
    // console.log(minWidthOverBase, minHeightOverBase)
    // const minDimen = Math.min(window.innerWidth, window.innerHeight);
    // const maxCels = Math.floor(minDimen / maxCelSize);



    // const gridSizeAtMax = [width, height].map(d => d * maxCelSize);
    // console.log('gridSizeAtMax', gridSizeAtMax)



    // const maxCelsX = Math.floor(window.innerWidth / maxCelSize);
    // const maxCelsY = Math.floor(window.innerHeight / maxCelSize);
    // console.log('maxCels', maxCels)











export default memo(function App({ mobile = false } = {}) {
  const params = useParams();
  const { width, height, colors } = params || {};

  const { ready, hasTouch, hasMouse } = useTouchDetect();
  useTouchZoomOverride(hasTouch);

  const windowRef = useRef(null);
  const touchRef = useRef(null);
  const canvasRef = useRef(null);
  const oversamplePx = 4;
  const { scalar } = useGrid({ params, canvasRef, oversamplePx });
  const { initialZoom, clampZoom } = useViewport({ width, height, scalar });



  // console.log('render', params, scalar, initialZoom)


  const [zoomActive, setZoomActive] = useState(null);
  const [scale, setScale] = useState(1);
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(null);
  const prevZoom = useRef(zoom);



  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (el) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      const targetX = scrollWidth * x - (clientWidth / 2);
      const targetY = scrollHeight * y - (clientHeight / 2);
      const deltaX = targetX - scrollLeft;
      const deltaY = targetY - scrollTop;
      el.scrollBy(deltaX, deltaY);
    };
  }, [windowRef]);


  const storeCenter = useCallback(() => {
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);



  useEffect(() => {
    if (initialZoom && !zoom) {

      // const paddedRandom = () => (Math.random() / 2) + .2;
      const paddedRandom = () => (Math.random() + 1) * .5;

      setZoom(initialZoom);
      const zoomTarget = [paddedRandom(), paddedRandom()];
      console.log(zoomTarget)
      panWindow(...zoomTarget);
    };
  }, [initialZoom, zoom, setZoom, panWindow])


  // useLayoutEffect(() => {

  // }, [])





  const __handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    if (targetTouches.length !== 2) {
      return setZoomActive(false);
    };
    e.preventDefault();
    prevZoom.current = zoom;

    storeCenter();
    setZoomActive(true);
  }, [setZoomActive, prevZoom, zoom, storeCenter]);


  const __handleTouchMove = useCallback(e => {
    if (!zoomActive) {
      return null;
    };
    const { scale, targetTouches } = e;
    if (!scale || targetTouches.length !== 2) {
      e.stopPropagation();
      return setZoomActive(false);
    };
    e.preventDefault();
    setScale(scale);
  }, [zoomActive, setZoomActive, setScale]);





  const makeNewCenter = useCallback((t1, t2) => {
    const el = windowRef.current;
    if (!el) return null;
    const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = el;
    const tX = ((t1.clientX + t2.clientX) / 2);
    const tY = ((t1.clientY + t2.clientY) / 2);


    const x = (scrollLeft + tX) / scrollWidth;
    const y = (scrollTop + tY) / scrollHeight;
    // alert(t1.target)
    // console.log()
    setCenter([x, y, t1.clientX, t1.clientY])
    // alert(x)
  }, [windowRef, setCenter])



  const handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    if (targetTouches.length !== 2) {
      return setZoomActive(false);
    };
    e.preventDefault();
    prevZoom.current = zoom;


    makeNewCenter(targetTouches[0], targetTouches[1]);
    // storeCenter();
    setZoomActive(true);
  }, [setZoomActive, prevZoom, zoom, makeNewCenter]);



  const handleTouchMove = useCallback(e => {
    const { scale, targetTouches } = e;
    if (!scale || targetTouches.length !== 2) {
      e.stopPropagation();
      return setZoomActive(false);
    };
    if (!zoomActive) {
      return null;
    };
    e.preventDefault();
    // setZoomActive(true)
    setScale(scale);
  }, [zoomActive, setZoomActive, setScale]);


  const handleTouchEnd = useCallback(e => {
    const { touches } = e;
    setCenter(null);
    setZoomActive(touches.length === 2);
  }, [setZoomActive, setCenter]);



  // useEffect(() => {
  //   const el = windowRef.current;
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
  // }, [windowRef, zoomActive, handleTouchMove, handleTouchEnd]);


  // useEffect(() => {
  //   const el = touchRef.current;
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
  // }, [touchRef, zoomActive, handleTouchMove, handleTouchEnd]);



  useEffect(() => {
    if (!zoomActive) {
      prevZoom.current = zoom;
      setCenter(null);
      setScale(1);
    };
    if (zoomActive) {
      const newZoom = clampZoom((prevZoom.current * scale));
      if (newZoom) {
        storeCenter();
        setZoom(newZoom);
      }
    };
  }, [zoomActive, prevZoom, clampZoom, zoom, setZoom, scale, setScale, storeCenter, setCenter]);



  useLayoutEffect(() => {   // recenter window
    if (zoomActive && center) {
      panWindow(...center);
    };
  }, [zoomActive, center, panWindow]);





  const handleClick = useCallback(e => {
    const { clientX, clientY } = e;
    const { x, y } = e.target.getBoundingClientRect();
    const cX = Math.floor((clientX - x) / (scalar * zoom));
    const cY = Math.floor((clientY - y) / (scalar * zoom));
    // console.log(box)
    console.log(cX, cY)
    // console.dir(e)
    // alert(`cel\n${cX}\n${cY}\n${zoom}`)
  }, [scalar, zoom]);




  const baseWidth = useMemo(() => scalar * width, [scalar, width]);
  const baseHeight = useMemo(() => scalar * height, [scalar, height]);





  return (
    <div id="App">
      {!ready && (
        <div className="Splash">
          <h1>Click anywhere to continue.</h1>
        </div>
      )}

      {params && (
        <div
          className="Grid--window"
          ref={windowRef}
          // onTouchStart={handleTouchStart}
          // onTouchEnd={handleTouchEnd}
          // onMouseDown={handleDragStart}
        >
          <div className="Grid--flex-wrap">
            <div className="Grid--wrap">
              {(initialZoom && (
                <div
                  ref={touchRef}
                  className="Grid--canvas-wrap"
                  style={{
                    width: baseWidth * zoom + 'px',
                    height: baseHeight * zoom + 'px',
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <canvas
                    className="Grid"
                    ref={canvasRef}
                    style={{ transform: `scale(${zoom})` }}
                    onClick={handleClick}
                  />
                  <GridLines
                    width={width}
                    height={height}
                    pxWidth={baseWidth * zoom}
                    pxHeight={baseHeight * zoom}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div id="Anchor"

          style={{ backgroundColor: zoomActive ? 'pink' : 'blue' }}
      >
        {zoom}<br />
        {center ? `${center[0]}\n${center[1]}` : 'no center'}
      </div>
    </div>
  );
});







      //   <h1>{scale}</h1>

