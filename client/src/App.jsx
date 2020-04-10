import React, { memo, useState, useRef, useCallback } from 'react';
import './App.css';
import { useGrid, useParams } from './hooks';
import { Grid, Colors, Cursors } from './components';
import User from './User.jsx';





export default memo(function App() {
  const params = useParams();
  const { colors, width, height } = params || {};

  const [activeColor, setActiveColor] = useState(11);
  const [cursorMode, setCursorMode] = useState('drag');
  const [celScale, setCelScale] = useState(10);
  const celScaleRange = [5, 50];

  const gridRef = useRef(null);
  const { username, postUsername } =
    useGrid({ gridRef, params, activeColor, cursorMode });


  const updateZoom = useCallback((zoomIn) => {
    const increment = Math.floor(Math.max(celScale / 5, 1));

    const [min, max] = celScaleRange;
    let newCelScale = celScale + (zoomIn ? increment : -increment);
    if (newCelScale >= max) {
      newCelScale = max;
    };
    if (newCelScale < min) {
      newCelScale = min;
    };

    setCelScale(newCelScale);
  }, [celScaleRange, celScale, setCelScale]);


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


  return (
    <div className="App">
      <Grid
        gridRef={gridRef}
        cursorMode={cursorMode}
        width={width}
        height={height}
        celScale={celScale}
      />
      <div className="Toolbar">
        <Colors
          palette={colors}
          activeColor={activeColor}
          setColor={handleClickColors}
        />
        <Cursors
          cursorMode={cursorMode}
          click={handleClickCursors}
        />
        <User
          username={username !== 'anonymous' ? username : ''}
          post={postUsername}
        />
      {/*
      */}
      </div>
    </div>
  );
});
