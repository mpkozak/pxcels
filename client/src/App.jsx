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


  const [cursorMode, setCursorMode] = useState(null);   // 0 = drag; 1 = paint;
  const [activeColor, setActiveColor] = useState(6);


  const splashRef = useRef(null);
  const { uiMode } = useInputDetect(splashRef);   // 0 = unknown; 1 = touch; 2 = mouse;


  const {
    gridReady,
    gridCanvas,
    gridMapCanvas,
    gridPaintCel,
    gridTooltipCel,
    // gridLastDraw,
  } = useGrid({
        width,
        height,
        colors,
        scalar,
        socketActive,
        addListener,
        activeColor,
      });


  const [zoom, setZoom] = useState(null);
  const [center, setCenter] = useState(null);
  const gridRef = useRef(null);
  const windowRef = useRef(null);


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


  const storeCenter = useCallback((reset = false) => {
    if (reset) {
      return setCenter(null);
    };
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);


  const calcZoom = useCallback((val) => {
    return parse.clamp(val, scaleRange).toFixed(2);
  }, [scaleRange])


  const updateZoom = useCallback((zoomIn) => {
    const newZoom = calcZoom(zoom * (zoomIn ? 1.4 : 0.6));
    if (newZoom) {
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoom, calcZoom, storeCenter]);


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
  }, [scaleInitial, zoom, setZoom, panWindow]);


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
          'Toolbar--top',
          [(!uiMode || !gridReady), 'Toolbar--hide'],
          [uiMode === 1, 'Toolbar--touch']
        )}
      >
        <div className="Toolbar__toolbox Toolbar__toolbox--left">
          left
        </div>

      </div>
      <div
        className={cl(
          'Toolbar',
          'Toolbar--bottom',
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
        gridRef={gridRef}
        windowRef={windowRef}
        canvasRef={gridCanvas}
        paintCel={gridPaintCel}
        tooltipCel={gridTooltipCel}
        width={width}
        height={height}
        scalar={scalar}
        zoom={zoom}
        setZoom={setZoom}
        calcZoom={calcZoom}
        storeCenter={storeCenter}
      />
    </div>
  );
});
