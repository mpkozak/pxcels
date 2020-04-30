import React, {
  memo,
  useRef,
  useState,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import './App.css';
import {
  useInit,
  useParams,
  useViewportScalar,
  useSocket,
  useGrid,
  useInputDetect,
  useZoom,
  useGlobalContext,
} from './hooks';
import { parse } from './libs';
import {
  Splash,
  Toolbar,
  Toolbox,
  User,
  Colors,
  Toggles,
  Mapbox,
  Grid,
} from './components';





export default memo(function App() {
  const {
    width,
    height,
    colors,
    scalar,
    scaleRange,
    scaleInitial,
  } = useInit();


  // useInit();
  // const [state, dispatch] = useGlobalContext();
  // const {
  //   width,
  //   height,
  //   colors,
  //   scalar,
  //   scaleRange,
  //   scaleInitial,
  // } = state;


  // useParams(dispatch);

  // useViewportScalar({ width, height, scalar, dispatch });

  const {
    socketActive,
    username,
    addListener,
    postMessage,
  } = useSocket();


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


  const gridRef = useRef(null);
  const windowRef = useRef(null);


  const {
    zoom,
    setZoom,
    calcZoom,
    updateZoom,
    storeCenter,
    panWindow,
  } = useZoom({
        gridRef,
        windowRef,
        scaleRange,
        scaleInitial,
      });


  useEffect(() => {   // set initial cursor mode
    if (uiMode && cursorMode === null) {
      setCursorMode(uiMode === 2 ? 0 : 1);
    };
  }, [uiMode, cursorMode, setCursorMode]);


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
                zoom={zoom}
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
