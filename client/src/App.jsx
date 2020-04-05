import React, { memo } from 'react';
import './App.css';
import { useGrid } from './hooks';
import { Grid, Colors } from './components';





export default memo(function App() {
  const { gridRef, username, color, setColor } = useGrid();

  console.log('app render', username)

  return (
    <div id="App">
      <Grid gridRef={gridRef} />
      <Colors
        activeColor={color}
        // handleColor={handleColor}
        handleColor={setColor}
      />
    </div>
  );
});
