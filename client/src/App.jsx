import React, {
  memo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import './App.css';
import {
  // useGlobalState,
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
// import GlobalStateProvider from './GlobalState.js';





export default memo(function App() {
  const splashRef = useRef(null);
  const windowRef = useRef(null);
  const touchRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const oversamplePx = 4;

  // const { state } = useGlobalState();
  // console.log("app test gs", state)

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

  const {
    scalar,
    initialScale,
    clampScale,
  } = useViewportScalar({
        width,
        height,
        oversamplePx,
      });


  const [cursorMode, setCursorMode] = useState(null);
  const [activeColor, setActiveColor] = useState(6);
  const [zoomActive, setZoomActive] = useState(null);
  const [scale, setScale] = useState(1);
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(null);
  const prevZoom = useRef(null);

  const {
    gridStatus,
    clickCel,
  } = useGrid({
        width,
        height,
        colors,
        scalar,
        gridCanvasRef,
        mapCanvasRef,
        oversamplePx,
        cursorMode,
        activeColor,
      });


  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (el) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      el.scrollTo(scrollLeft, scrollTop);
      const targetX = scrollWidth * x - (clientWidth / 2);
      const targetY = scrollHeight * y - (clientHeight / 2);
      if (targetX >= scrollWidth || targetY >= scrollHeight || targetX <= 0 || targetY <= 0) {
        return null;
      };
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

  // const storeDynamicCenter = useCallback((t1, t2) => {
  //   const el = windowRef.current;
  //   if (!el) return null;
  //   const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = el;
  //   const tX = ((t1.clientX + t2.clientX) / 2);
  //   const tY = ((t1.clientY + t2.clientY) / 2);
  //   const x = (scrollLeft + tX) / scrollWidth;
  //   const y = (scrollTop + tY) / scrollHeight;
  //   setCenter([x, y, t1.clientX, t1.clientY]);
  // }, [windowRef, setCenter]);

  const updateZoom = useCallback((zoomIn) => {
    const newZoom = clampScale(zoom * (zoomIn ? 1.4 : 0.6));
    if (newZoom) {
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoom, clampScale, storeCenter]);


  const handleClickColors = useCallback(e => {
    const { id } = e.target;
    if (!id) return null;
    const color = +id.split('-')[1];
    setActiveColor(color);
  }, [setActiveColor]);

  const handleClickCursors = useCallback(e => {
    const { id } = e.target;
    if (!id) return null;
    const [setting, value] = id.split('-');
    if (setting === 'cursor') {
      return setCursorMode(value);
    };
    if (setting === 'zoom') {
      return updateZoom(+value);
    };
  }, [setCursorMode, updateZoom]);


  useEffect(() => {   // set initial cursor mode
    // console.log('App ef-1')
    if (hidStatus && !cursorMode) {
      // console.log('App ef-1 --- set initial cursor mode')
      setCursorMode(hasMouse ? 'drag' : 'paint');
    };
  }, [hidStatus, cursorMode, setCursorMode, hasMouse]);


  useEffect(() => {   // set initial zoom and scroll to random spot
    // console.log('App ef-2')
    if (initialScale && !zoom) {
      // console.log('App ef-2 --- set initial zoom and scroll to random spot')
      const paddedRandom = () => (Math.random() + 1) * .5;
      setZoom(initialScale);
      panWindow(paddedRandom(), paddedRandom());
    };
  }, [initialScale, zoom, setZoom, panWindow])





  const handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    if (targetTouches.length !== 2) {
      return setZoomActive(false);
    };
    e.preventDefault();
    prevZoom.current = zoom;
    storeCenter();
    setZoomActive(true);
  }, [setZoomActive, prevZoom, zoom, storeCenter]);

  const handleTouchMove = useCallback(e => {
    const { scale, targetTouches } = e;
    if (!scale || targetTouches.length !== 2) {
      // e.stopPropagation();
      return setZoomActive(false);
    };
    if (!zoomActive) {
      return null;
    };
    e.preventDefault();
    storeCenter();
    setScale(scale);
  }, [zoomActive, setZoomActive, storeCenter, setScale]);

  const handleTouchEnd = useCallback(e => {
    setCenter(null);
    setZoomActive(false);
  }, [setZoomActive, setCenter]);


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



  // const handleTouchStart = useCallback(e => {
  //   storeCenter();
  //   prevZoom.current = zoom;
  // }, [storeCenter, prevZoom, zoom]);

  // const handleTouchMove = useCallback(e => {
  //   const { scale, targetTouches} = e;
  //   if (!scale || targetTouches.length !== 2) return null;
  //   setScale(scale);
  // }, [setScale]);

  // const handleTouchEnd = useCallback(e => {
  //   setScale(null);
  //   setCenter(null);
  // }, [setScale, setCenter]);

  // useEffect(() => {
  //   const el = touchRef.current;
  //   if (el && scale) {
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
  // }, [touchRef, scale, handleTouchMove, handleTouchEnd]);

  // useEffect(() => {
  //   if (scale) {
  //     const newZoom = clampScale((prevZoom.current * scale));
  //     setZoom(newZoom);
  //     storeCenter();
  //   } else {
  //     prevZoom.current = zoom;
  //     setCenter(null);
  //     setScale(1);
  //   }
  // }, [scale, clampScale, prevZoom, zoom, setZoom, storeCenter, setCenter, setScale]);

  // useLayoutEffect(() => {   // recenter window
  //   if (center) {
  //     panWindow(...center);
  //   };
  // }, [center, panWindow]);



  return (
    <div id="App">
      {!hidStatus && (
        <Splash
          splashRef={splashRef}
          gridStatus={gridStatus}
        />
      )}
      <div
        className={
          'Toolbar'
          + (!hidStatus ? ' hide' : '')
          + (hasTouch ? ' touch' : '')
        }
      >
        <div className="Toolbar--toolbox left">
          <Colors
            colors={colors}
            activeColor={activeColor}
            clickColor={handleClickColors}
            hasMouse={hasMouse}
          />
          {hasMouse && (
            <Cursors
              cursorMode={cursorMode}
              clickCursor={handleClickCursors}
              hasMouse={hasMouse}
            />
          )}
        </div>
        <div className="Toolbar--toolbox right">
          <Minimap
            windowRef={windowRef}
            gridRef={touchRef}
            mapCanvasRef={mapCanvasRef}
            pan={panWindow}
            hasMouse={hasMouse}
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
        <User
          username={username !== 'anonymous' ? username : ''}
          post={postUsername}
        />
      */}
    </div>
  );
});

















// function Preload() {
//   const { state, setState } = useGlobalState();

// // useParams();
//   const params = useParams();


  // const { active, post, username, postUsername } = useSocket(handleSocketMessage);







//   // const {
//   //   width,
//   //   height,
//   //   colors,
//   // } = state;


//   console.log("app test gs", state)

//   const splashRef = useRef(null);
//   const {
//     hidStatus,
//     hasTouch,
//     hasMouse,
//   } = useHIDDetect(splashRef);

//   useTouchZoomOverride(hasTouch);

//   return (


//   );
// };









// export default function AppHOC() {

//   return (
//     <GlobalStateProvider>
//       <App />
//     </GlobalStateProvider>
//   );
// };















