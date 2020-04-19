import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  useRef,
  // useMemo,
  useState,
  // useReducer,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import './App.css';
import {
  useParams,
  useSocket,
  useViewportScalar,
  useGrid,
  useInputDetect,
} from './hooks';
import { parse, cl } from './libs';
import {
  Splash,
  Colors,
  Toggles,
  Mapbox,
  Grid,
} from './components';





function useInit() {
  const {
    width,
    height,
    colors = [],
  } = useParams() || {};

  const {
    scalar,
    scaleRange,
    scaleInitial,
  } = useViewportScalar({ width, height });

  const {
    socketActive,
    username,
    addListener,
    postMessage,
  } = useSocket();

  // console.log('useInit ran')
  // return useMemo(() => {
  //   console.log("useInit memo ran again")
  //   return {
  //     width,
  //     height,
  //     colors,
  //     scalar,
  //     scaleRange,
  //     scaleInitial,
  //     socketActive,
  //     username,
  //     addListener,
  //     postMessage,
  //   }
  // }, [
  //   width,
  //   height,
  //   colors,
  //   scalar,
  //   scaleRange,
  //   scaleInitial,
  //   socketActive,
  //   username,
  //   addListener,
  //   postMessage,
  // ])


  return {
    width,
    height,
    colors,
    scalar,
    scaleRange,
    scaleInitial,
    socketActive,
    username,
    addListener,
    postMessage,
  };
};






// function useColors({
//   colors = [],
// }) {

//   const [activeColor, setActiveColor] = useState(6);



// };








export default memo(function App() {
  const {
    width,
    height,
    colors,
    scalar,
    scaleRange,
    scaleInitial,
    socketActive,
    // username,
    addListener,
    // postMessage,
  } = useInit();

  const splashRef = useRef(null);
  const { uiMode } = useInputDetect(splashRef);   // 0 = unknown; 1 = touch; 2 = mouse;

  const [cursorMode, setCursorMode] = useState(null);   // 0 = drag; 1 = paint;
  const [activeColor, setActiveColor] = useState(6);

  const {
    gridReady,
    gridCanvas,
    gridMapCanvas,
    gridPaintCel,
    // gridLastDraw,
  } = useGrid({
        width,
        height,
        colors,
        scalar,
        socketActive,
        addListener,
        cursorMode,
        activeColor,
      });



  const [zoomActive, setZoomActive] = useState(null);
  const [scale, setScale] = useState(1);
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(null);
  const prevZoom = useRef(null);

  const windowRef = useRef(null);
  const gridRef = useRef(null);


  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (el) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      el.scrollTo(scrollLeft, scrollTop);
      const targetX = scrollWidth * x - (clientWidth / 2);
      const targetY = scrollHeight * y - (clientHeight / 2);
      const deltaX = parse.clamp(targetX, [0, scrollWidth]) - scrollLeft;
      const deltaY = parse.clamp(targetY, [0, scrollHeight]) - scrollTop;
      el.scrollBy(deltaX, deltaY);
    };
  }, [windowRef]);


  const storeCenter = useCallback(() => {
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);


  const updateZoom = useCallback((zoomIn) => {
    const newZoom = parse.clamp(zoom * (zoomIn ? 1.4 : 0.6), scaleRange).toFixed(2);
    if (newZoom) {
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoom, scaleRange, storeCenter]);


  useEffect(() => {   // set initial cursor mode
    // console.log('App ef-1')
    if (uiMode && cursorMode === null) {
      // console.log('App ef-1 --- set initial cursor mode')
      setCursorMode(uiMode === 2 ? 0 : 1);
    };
  }, [uiMode, cursorMode, setCursorMode]);


  useEffect(() => {   // set initial zoom and scroll to random spot
    // console.log('App ef-2')
    if (scaleInitial && !zoom) {
      // console.log('App ef-2 --- set initial zoom and scroll to random spot')
      const paddedRandom = () => (Math.random() + 1) * .5;
      setZoom(scaleInitial);
      panWindow(paddedRandom(), paddedRandom());
    };
  }, [scaleInitial, zoom, setZoom, panWindow])




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
    const el = gridRef.current;
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
  }, [gridRef, zoomActive, handleTouchMove, handleTouchEnd]);


  useEffect(() => {
    if (!zoomActive) {
      prevZoom.current = zoom;
      setCenter(null);
      setScale(1);
    };
    if (zoomActive) {
      const newZoom = parse.clamp(prevZoom.current * scale, scaleRange).toFixed(2);
      if (newZoom) {
        storeCenter();
        setZoom(newZoom);
      };
    };
  }, [zoomActive, prevZoom, zoom, scaleRange, setZoom, scale, setScale, storeCenter, setCenter]);


  useLayoutEffect(() => {   // recenter window
    if (center) {
      panWindow(...center);
    };
  }, [center, panWindow]);


  return (
    <div id="App">
      {!uiMode && (
        <Splash splashRef={splashRef} gridReady={gridReady} />
      )}
      <div
        className={cl(
          'Toolbar',
          [(!uiMode || !gridReady), 'Toolbar--hide'],
          [uiMode === 1, 'Toolbar--touch']
        )}
      >
        <div className="Toolbar__toolbox Toolbar__toolbox--left">
          <Colors
            uiMode={uiMode}
            colors={colors}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
          />
          {(uiMode === 2) && (
            <Toggles
              cursorMode={cursorMode}
              setCursorMode={setCursorMode}
              updateZoom={updateZoom}
            />
          )}
        </div>
        <div className="Toolbar__toolbox Toolbar__toolbox--right">
          <Mapbox
            uiMode={uiMode}
            gridRef={gridRef}
            windowRef={windowRef}
            canvasRef={gridMapCanvas}
            panWindow={panWindow}
          />
        </div>
      </div>
      <Grid
        uiMode={uiMode}
        cursorMode={cursorMode}
        windowRef={windowRef}
        canvasRef={gridCanvas}
        paintCel={gridPaintCel}
        scalar={scalar}
        zoom={zoom}


        gridRef={gridRef}
        width={width}
        height={height}
        scalar={scalar}
        zoom={zoom}
        touchStart={handleTouchStart}
      />
    </div>
  );
});
