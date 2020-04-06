import React, { memo } from 'react';
import './App.css';
import { useGrid } from './hooks';
import { Grid, Colors } from './components';





export default memo(function App() {
  const {
    gridRef,
    canvasRef,
    // username,
    // lastDraw,
    color,
    setColor
  } = useGrid();





  // console.log('app render', username, lastDraw)

  return (
    <div id="App">
      <canvas id="CANV"
        ref={canvasRef}
        width={128}
        height={72}
      />
      <Grid gridRef={gridRef} />
      <Colors
        activeColor={color}
        setColor={setColor}
      />
    </div>
  );
});
