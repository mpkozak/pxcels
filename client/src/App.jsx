import React, { memo, useState, useRef, useCallback } from 'react';
import './App.css';
import { useGrid, useParams, useViewport } from './hooks';
import { Grid, Colors, Cursors } from './components';
import User from './User.jsx';












export default memo(function App() {
  const params = useParams();
  const { colors, width, height } = params || {};

  const [activeColor, setActiveColor] = useState(6);
  const [cursorMode, setCursorMode] = useState('drag');







  const gridRef = useRef(null);
  const canvasRef = useRef(null);
  // const { username, postUsername, dataRef } =
    useGrid({ params, gridRef, canvasRef, activeColor, cursorMode });

  const celScaleRange = [2, 4, 8, 16, 32, 64, 128];
  const [celScale, setCelScale] = useState(3);


  const updateZoom = useCallback((zoomIn) => {
    const newCelScale = celScale + (zoomIn ? 1 : -1);
    if (!celScaleRange[newCelScale]) {
      return null;
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


  const [showMap, setShowMap] = useState(false);

  const handleClickMap = useCallback(e => {
    if (showMap) {
      console.log('is large', e)
    }
    setShowMap(!showMap);
  }, [showMap, setShowMap])


  return (
    <div className="App">

      <Grid
        gridRef={gridRef}
        cursorMode={cursorMode}
        width={width}
        height={height}
        celScale={celScaleRange[celScale]}
      >
      </Grid>


      <div className="Minimap">
        <div className="minimap toolbox">
          <div className="toolbox--inner">
            <canvas
              className={'canvas' + (showMap ? ' large' : '')}
              ref={canvasRef}
              onClick={handleClickMap}
            />
          </div>
        </div>
      </div>

{/*
      <div className="canv-wrap">
        <div className="canv-flex">
          <canvas
            id="CANV"
            className="Canvas"
            ref={canvasRef}
            width={celScaleRange[celScale] * width || 1000}
            height={celScaleRange[celScale] * height || 1000}
            style={{
              // position: 'absolute',
              // width: (celScaleRange[celScale] * width) + 'px',
              // height: (celScaleRange[celScale] * height) + 'px',
            }}
          />

        </div>
      </div>
*/}


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
