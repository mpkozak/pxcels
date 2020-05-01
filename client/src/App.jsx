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
  useGrid,
  useZoom,
} from './hooks';
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
  // console.log("SETTING APP STATE ---", action)

  return ({ ...state, ...action });
};





export default memo(function App() {
  const [context] = useGlobalContext();
  const { uiMode } = context;


  void useParams();
  void useViewportScalar();


  const gridRef = useRef(null);
  const windowRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const mapCanvasRef = useRef(null);


  const [state, dispatch] = useReducer(appReducer, appState);
  const {
    cursorMode,
    activeColor,
    showSplash,
  } = state;


  const {
    username,
    addListener,
    postMessage,
  } = useSocket();


  const {
    gridReady,
    paintCel,
    showTooltip,
    // lastDraw,
  } = useGrid({
        gridCanvasRef,
        mapCanvasRef,
        activeColor,
        addListener,
      });


  const {
    zoom,
    updateZoom,
    panWindow,
    zoomListeners,
  } = useZoom({
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
      <Toolbar hidden={showSplash} pos="top">
        <Toolbox pos="left">
          <User
            username={username}
            postMessage={postMessage}
          />
        </Toolbox>
      </Toolbar>
      <Toolbar hidden={showSplash} pos="bottom">
        <Toolbox pos="left">
          <Colors
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
            gridRef={gridRef}
            windowRef={windowRef}
            mapCanvasRef={mapCanvasRef}
            zoom={zoom}
            panWindow={panWindow}
          />
        </Toolbox>
      </Toolbar>
      <Grid
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
