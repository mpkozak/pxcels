import React, {
  memo,
  useRef,
  useReducer,
} from 'react';
import './App.css';
import {
  useGlobalContext,
  useParams,
  useViewportScalar,
  useSocket,
  // useInputDetect,

  useGrid,
  useZoom,
} from './hooks';
// import { parse } from './libs';
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





const appState = {
  cursorMode: 0,      // 0 = drag; 1 = paint;
  activeColor: 6,
  showSplash: true,
  // gridStatus: 0     // 0 = has now drawn; 1 = completed initial draw;
};


function appReducer(state, action) {
  console.log("SETTING APP STATE ---", action)

  return ({ ...state, ...action });
};





export default memo(function App() {
  const [state] = useGlobalContext();
  const {
    width,
    height,
    colors,
    scalar,
    scaleRange,
    scaleInitial,
    uiMode,
  } = state;


  void useParams();
  void useViewportScalar();


  const gridRef = useRef(null);
  const windowRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const mapCanvasRef = useRef(null);


  const [localState, dispatch] = useReducer(appReducer, appState);
  const {
    cursorMode,
    activeColor,
    showSplash,
  } = localState;


  const {
    username,
    addListener,
    postMessage,
  } = useSocket();


  const {
    gridReady,
    paintCel,
    showTooltip,
    // gridLastDraw,
  } = useGrid({
        width,
        height,
        colors,
        scalar,
        activeColor,
        gridCanvasRef,
        mapCanvasRef,
        addListener,
      });


  const {
    zoom,
    updateZoom,
    panWindow,
    zoomListeners,
  } = useZoom({
        uiMode,
        scaleRange,
        scaleInitial,
        gridRef,
        windowRef,
      });



  return (
    <div id="App">
      {showSplash && (
        <Splash
          gridReady={gridReady}
          hideSplash={() => dispatch({ showSplash: false })}
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
            setActiveColor={val => dispatch({ activeColor: val })}
          />
          {(uiMode === 2) && (
            <Toggles
              cursorMode={cursorMode}
              setCursorMode={val => dispatch({ cursorMode: val })}
              updateZoom={updateZoom}
            />
          )}
        </Toolbox>
        <Toolbox pos="right">
          <Mapbox
            uiMode={uiMode}
            gridRef={gridRef}
            windowRef={windowRef}
            canvasRef={mapCanvasRef}
            zoom={zoom}
            panWindow={panWindow}
          />
        </Toolbox>
      </Toolbar>
      <Grid
        width={width}
        height={height}
        scalar={scalar}
        uiMode={uiMode}

        gridRef={gridRef}
        windowRef={windowRef}
        gridCanvasRef={gridCanvasRef}

        cursorMode={cursorMode}

        paintCel={paintCel}
        showTooltip={showTooltip}

        zoom={zoom}
        zoomListeners={zoomListeners}
      />
    </div>
  );
});
