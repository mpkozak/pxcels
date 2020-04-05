import React, { memo, useState, useCallback } from 'react';
import './App.css';
import { useGrid } from './hooks';
import { Grid, Colors } from './components';





export default memo(function App() {
  const { gridRef, post } = useGrid();
  const [color, setColor] = useState(null);


  const handleColor = useCallback(val => {
    console.log('handleColor', val)
    setColor(val);
  }, [setColor]);


  const handleGridClick = useCallback(e => {
    const { id } = e.target;
    if (!id || !color) {
      return null;
    };
    post('set_cel', { id, color, t: Date.now() });
  }, [post, color]);


  return (
    <div id="App">
      <Grid
        gridRef={gridRef}
        click={handleGridClick}
      />
      <Colors
        activeColor={color}
        handleColor={handleColor}
      />
    </div>
  );
});
