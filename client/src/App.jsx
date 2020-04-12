import React, { memo, useLayoutEffect, useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { useGrid, useParams } from './hooks';
import { Grid, Colors, Cursors, Minimap } from './components';
// import User from './User.jsx';





export default memo(function App({ mobile = false } = {}) {
  const params = useParams();
  const { colors, width, height } = params || {};

  const celScaleRange = [2, 4, 8, 16, 32, 64, 128];
  const [celScale, setCelScale] = useState(4);
  const [activeColor, setActiveColor] = useState(6);
  const [cursorMode, setCursorMode] = useState(mobile ? 'paint' : 'drag');

  const windowRef = useRef(null);
  const gridRef = useRef(null);
  const canvasRef = useRef(null);


  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (el) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      const targetX = scrollWidth * x - clientWidth / 2;
      const targetY = scrollHeight * y - clientHeight / 2;
      const deltaX = targetX - scrollLeft;
      const deltaY = targetY - scrollTop;
      el.scrollBy(deltaX, deltaY);
    };
  }, [windowRef]);


  // const { username, postUsername, lastDraw } =
  useGrid({
    mobile,
    params,
    gridRef,
    canvasRef,
    activeColor,
    cursorMode,
    panWindow,
  });


  const [center, setCenter] = useState(null);

  const storeCenter = useCallback(() => {
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);




  const updateZoom = useCallback((zoomIn) => {
    const newCelScale = celScale + (zoomIn ? 1 : -1);
    if (!celScaleRange[newCelScale]) {
      return null;
    };
    storeCenter();
    setCelScale(newCelScale);
  }, [celScaleRange, celScale, setCelScale, storeCenter]);







  // const updateZoom = useCallback((zoomIn) => {
  //   const newCelScale = celScale + (zoomIn ? 1 : -1);
  //   if (!celScaleRange[newCelScale]) {
  //     return null;
  //   };
  //   setCelScale(newCelScale);
  // }, [celScaleRange, celScale, setCelScale]);


  const handleClickColors = useCallback(e => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const color = +id.split('-')[1];
    setActiveColor(color);
  }, [setActiveColor]);


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
    if (center) {
      panWindow(...center);
      setCenter(null);
    };
  }, [center, setCenter, panWindow]);




  return (
    <div className="App">
      <Grid
        windowRef={windowRef}
        gridRef={gridRef}
        cursorMode={cursorMode}
        width={width}
        height={height}
        celScale={celScaleRange[celScale]}
      />
      <div className="Toolbar">
        <div className="Toolbar--toolbox left">
          <Colors
            palette={colors}
            activeColor={activeColor}
            setColor={handleClickColors}
          />
          {!mobile && (
            <Cursors
              cursorMode={cursorMode}
              click={handleClickCursors}
            />
          )}
        </div>
        <div className="Toolbar--toolbox right">
          <Minimap
            canvasRef={canvasRef}
            windowRef={windowRef}
            gridRef={gridRef}
            pan={panWindow}
          />
        </div>

      {/*
        <User
          username={username !== 'anonymous' ? username : ''}
          post={postUsername}
        />
      */}

      </div>
    </div>
  );
});
