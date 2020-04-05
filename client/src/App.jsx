import React, { memo } from 'react';
import './App.css';
import { useGrid } from './hooks';
import { Grid, Colors } from './components';





export default memo(function App() {
  const { gridRef, username, lastDraw, color, setColor } = useGrid();

  // console.log('app render', username, lastDraw)

  return (
    <div id="App">
      <Grid gridRef={gridRef} />
      <Colors
        activeColor={color}
        setColor={setColor}
      />
    </div>
  );
});
