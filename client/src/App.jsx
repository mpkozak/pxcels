import React, {
  memo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import './App.css';
import { useInit, useGrid, useInputDetect } from './hooks';
import { parse, cl } from './libs';
import {
  Splash,
  User,
  Colors,
  Toggles,
  Mapbox,
  Grid,
} from './components';





const Toolbar = memo(function Toolbar({
  uiMode = 0,
  hidden = true,
  pos = '',
  children,
} = {}) {


  return (
    <div
      className={cl(
        'Toolbar',
        `Toolbar--${pos}`,
        [hidden, 'Toolbar--hide'],
        [uiMode === 1, 'Toolbar--touch']
      )}
    >
      {children}
    </div>
  );
});





const Toolbox = memo(function Toolbox({ pos = '', children } = {}) {
  return (
    <div className={cl('Toolbox', `Toolbox--${pos}`)}>
      {children}
    </div>
  );
});





export default memo(function App() {
  const {
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
  } = useInit();


  const [cursorMode, setCursorMode] = useState(null);   // 0 = drag; 1 = paint;
  const [activeColor, setActiveColor] = useState(6);


  const splashRef = useRef(null);
  const { uiMode } = useInputDetect(splashRef);   // 0 = unknown; 1 = touch; 2 = mouse;


  const [showSplash, setShowSplash] = useState(!uiMode);


  const hideSplash = useCallback(() => {
    setShowSplash(false);
  }, [setShowSplash]);


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
    if (uiMode && cursorMode === null) {
      setCursorMode(uiMode === 2 ? 0 : 1);
    };
  }, [uiMode, cursorMode, setCursorMode]);


  useEffect(() => {   // set initial zoom and scroll to random spot
    if (scaleInitial && !zoom) {
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
      {showSplash && (
        <Splash
          splashRef={splashRef}
          gridReady={gridReady}
          hideSplash={hideSplash}
        />
      )}
      <Toolbar uiMode={uiMode} hidden={showSplash} pos="top">
        <Toolbox pos="left">
          <User
            uiMode={uiMode}
            username={username}
            postMessage={postMessage}
          />
        </Toolbox>
      </Toolbar>
      <Toolbar uiMode={uiMode} hidden={showSplash} pos="bottom">
        <Toolbox pos="left">
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
        </Toolbox>
        <Toolbox pos="right">
          <Mapbox
            uiMode={uiMode}
            gridRef={gridRef}
            windowRef={windowRef}
            canvasRef={gridMapCanvas}
            panWindow={panWindow}
          />
        </Toolbox>
      </Toolbar>
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
