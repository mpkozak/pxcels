import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  // useRef,
  // useMemo,
  // useState,
  // useReducer,
  // useEffect,
  // useLayoutEffect,
  // useCallback,
} from 'react';

import './App.css';
import {
  // useGlobalState,
  // useGlobalContext,
  useParams,
  useSocket,
  useInputDetect,
  // useTouchZoomOverride,
  useGrid,
  useViewportScalar,
} from './hooks';
import { parse } from './libs';
import {
  // Colors,
  // Cursors,
  // Grid,
  // Minimap,
  Splash,
} from './components';



const { cl } = parse;




const App = memo(function App({
  socketPost,
  initialScale,
  grid,
  ready,
  // uiMode,
  touch,
  mouse,
  children,
} = {}) {

// const App = memo(function App(props) {

  // const {
  //   postMessage,
  //   addListener,
  // } = socket;


  console.log("APP PROPS",
    // socketPost,
    initialScale,
    grid,
    ready,
  touch,
  mouse,
  children,
  )



  return (
    <div id="App">
      {children}
      <div className={cl('Toolbar', [!ready, 'hide'], { touch })}>
        <div className="Toolbar--toolbox left">
        </div>
        <div className="Toolbar--toolbox right">
        </div>
      </div>
    </div>
  );
})



          // <Colors />
          // {mouse && (
          //   <Cursors
          //     // cursorMode={cursorMode}
          //     // clickCursor={handleClickCursors}
          //     // hasMouse={hasMouse}
          //   />
          // )}



          // <Colors
          //   colors={colors}
          //   activeColor={activeColor}
          //   clickColor={handleClickColors}
          //   hasMouse={hasMouse}
          // />
          // {hasMouse && (
          //   <Cursors
          //     cursorMode={cursorMode}
          //     clickCursor={handleClickCursors}
          //     hasMouse={hasMouse}
          //   />
          // )}

          // <Minimap
          //   windowRef={windowRef}
          //   gridRef={touchRef}
          //   mapCanvasRef={mapCanvasRef}
          //   pan={panWindow}
          //   hasMouse={hasMouse}
          // />



  // const {
  //   gridReady,
  //   gridCanvasRef,
  //   mapCanvasRef,
  //   clickCel,
  // } = useGrid({ socketActive, addListener });





export default memo(function HOC() {
  void useParams();

  // return null
  const { postMessage, ...socket } = useSocket();
  const initialScale = useViewportScalar();
  // const { gridReady, ...grid } = useGrid(socket);
  // const { uiReady, detectionRef, uiMode } = useInputDetect();

  // const ready = gridReady && uiReady;

  // return (
  //   <App
  //     socketPost={postMessage}
  //     initialScale={initialScale}
  //     grid={grid}
  //     ready={ready}
  //     touch={uiMode === 1}
  //     mouse={uiMode === 2}
  //   >
  //    {!ready && (
  //       <Splash splashRef={detectionRef} loading={!gridReady} />
  //     )}
  //   </App>
  // );
});






