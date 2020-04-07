import React, { memo, useState, useCallback } from 'react';
import './App.css';
import { useGrid, useParams } from './hooks';
import { Grid, Colors } from './components';



export default memo(function App() {
  const params = useParams();
  const [cursorMode, setCursorMode] = useState('drag');
  const {
    gridRef,
    colorRef,
    // canvasRef,
  } = useGrid(params, cursorMode);

  const { colors, ...dimen } = params || {};


  const handleToolClick = useCallback(e => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const cursor = id.split('-')[1];
    setCursorMode(cursor);
  }, [setCursorMode]);


  return (
    <div className="App">
      <Grid
        gridRef={gridRef}
        dimen={dimen}
        cursorMode={cursorMode}
      />
      <Colors
        colorRef={colorRef}
        palette={colors}
      />
      <div className="Tools" onClick={handleToolClick}>
        <div
          id="tool-paint"
          className={
            'Tools--button button paint' + (cursorMode === 'paint' ? ' active' : '')
          }
        />
        <div
          id="tool-drag"
          className={
            'Tools--button button drag' + (cursorMode === 'drag' ? ' active' : '')
          }
        />
      </div>
    </div>
  );
});

      // <canvas id="CANV"
      //   ref={canvasRef}
      //   width={128}
      //   height={72}
      // />
