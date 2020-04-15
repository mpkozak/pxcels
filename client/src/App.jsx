import React, {
  // Fragment,
  memo,
  useRef,
  // useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import './App.css';
import {
  useParams,
  useHIDDetect,
  useTouchZoomOverride,
  useGrid,
  useViewportScalar,
} from './hooks';
import {
  Colors,
  Cursors,
  Grid,
  Minimap,
  Splash,
} from './components';





export default memo(function App() {
  const splashRef = useRef(null);
  const windowRef = useRef(null);
  const touchRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const oversamplePx = 4;

  const {
    width,
    height,
    colors,
  } = useParams();

  const {
    hidStatus,
    hasTouch,
    hasMouse,
  } = useHIDDetect(splashRef);

  useTouchZoomOverride(hasTouch);

  const [cursorMode, setCursorMode] = useState(null);
  const [activeColor, setActiveColor] = useState(6);
  const [zoomActive, setZoomActive] = useState(null);
  const [scale, setScale] = useState(1);
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(null);
  const prevZoom = useRef(null);

  const {
    gridStatus,
    scalar,
    clickCel
  } = useGrid({
        width,
        height,
        colors,
        gridCanvasRef,
        mapCanvasRef,
        oversamplePx,
        cursorMode,
        activeColor,
      });

  const {
    initialScale,
    clampScale,
  } = useViewportScalar({
        width,
        height,
        scalar,
      });


  const handleClickColors = useCallback(e => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const color = +id.split('-')[1];
    setActiveColor(color);
  }, [setActiveColor]);




  const storeCenter = useCallback(() => {
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);


  const updateZoom = useCallback((zoomIn) => {
    const newZoom = clampScale(zoom * (zoomIn ? 1.2 : 0.8));
    if (newZoom) {
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoom, clampScale, storeCenter]);


  const handleClickCursors = useCallback(e => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const [setting, value] = id.split('-');
    if (setting === 'cursor') {
      return setCursorMode(value);
    };
    if (setting === 'zoom') {
      return updateZoom(+value);
    };
  }, [setCursorMode, updateZoom]);


  useEffect(() => {
    if (hidStatus && !cursorMode) {
      setCursorMode(hasTouch ? 'paint' : 'drag');
    };
  }, [hidStatus, hasTouch, cursorMode, setCursorMode]);




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


  // const storeCenter = useCallback(() => {
  //   const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
  //   const x = (scrollLeft + clientWidth / 2) / scrollWidth;
  //   const y = (scrollTop + clientHeight / 2) / scrollHeight;
  //   setCenter([x, y]);
  // }, [windowRef, setCenter]);



  useEffect(() => {
    if (initialScale && !zoom) {

      // const paddedRandom = () => (Math.random() / 2) + .2;
      const paddedRandom = () => (Math.random() + 1) * .5;

      setZoom(initialScale);
      const zoomTarget = [paddedRandom(), paddedRandom()];
      // console.log(zoomTarget)
      panWindow(...zoomTarget);
    };
  }, [initialScale, zoom, setZoom, panWindow])







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



    setCenter([x, y, t1.clientX, t1.clientY])
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


  useEffect(() => {
    const el = touchRef.current;
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
  }, [touchRef, zoomActive, handleTouchMove, handleTouchEnd]);



  useEffect(() => {
    if (!zoomActive) {
      prevZoom.current = zoom;
      setCenter(null);
      setScale(1);
    };
    if (zoomActive) {
      const newZoom = clampScale((prevZoom.current * scale));
      if (newZoom) {
        storeCenter();
        setZoom(newZoom);
      };
    };
  }, [zoomActive, prevZoom, clampScale, zoom, setZoom, scale, setScale, storeCenter, setCenter]);



  useLayoutEffect(() => {   // recenter window
    // if (zoomActive && center) {
    if (center) {
      panWindow(...center);
    };
  }, [zoomActive, center, panWindow]);





  return (
    <div id="App">
      {!hidStatus && (
        <Splash
          splashRef={splashRef}
          gridStatus={gridStatus}
        />
      )}

      <div className={'Toolbar' + (!hidStatus ? ' hide' : '') + (hasTouch ? ' touch' : '')}>
        <div className="Toolbar--toolbox left">
          <Colors
            palette={colors}
            activeColor={activeColor}
            clickColor={handleClickColors}
          />
          {hasMouse && (
            <Cursors
              cursorMode={cursorMode}
              click={handleClickCursors}
            />
          )}
        </div>
        <div className="Toolbar--toolbox right">
          <Minimap
            windowRef={windowRef}
            gridRef={touchRef}
            mapCanvasRef={mapCanvasRef}
            pan={panWindow}
          />
        </div>
      </div>

      <Grid
        windowRef={windowRef}
        touchRef={touchRef}
        gridCanvasRef={gridCanvasRef}
        width={width}
        height={height}
        scalar={scalar}
        zoom={zoom}
        cursorMode={cursorMode}
        clickCel={clickCel}
        touchStart={handleTouchStart}
      />


      {/*
      */}

      {/*
        <User
          username={username !== 'anonymous' ? username : ''}
          post={postUsername}
        />
      */}
    </div>
  );
});
