import React, { memo } from 'react';
import './App.css';
import { useGrid, useParams } from './hooks';
import { Grid, Colors } from './components';





export default memo(function App() {
  const params = useParams();
  const {
    gridRef,
    colorRef,
    // canvasRef,
  } = useGrid(params);


  const { colors, ...dimen } = params || {};


  return (
    <div className="App">
      <Grid
        gridRef={gridRef}
        dimen={dimen}
      />
      <Colors
        colorRef={colorRef}
        palette={colors}
      />
    </div>
  );
});

      // <canvas id="CANV"
      //   ref={canvasRef}
      //   width={128}
      //   height={72}
      // />
