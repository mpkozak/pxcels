import React, { memo } from 'react';
import './App.css';
import { useGrid } from './hooks';
import { Grid, Colors } from './components';





export default memo(function App() {
  const {
    params,
    gridRef,
    // canvasRef,
    colorRef,
    // username,
    // lastDraw,
    // color,
    // setColor,
  } = useGrid();



  return (
    <div className="App">
      <Grid gridRef={gridRef} />
      {!!params && (
        <Colors
          colorRef={colorRef}
          palette={params.colors}
        />
      )}
    </div>
  );
});

      // <canvas id="CANV"
      //   ref={canvasRef}
      //   width={128}
      //   height={72}
      // />
