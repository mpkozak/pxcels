import React, { memo, useState, useCallback } from 'react';
import './App.css';
import { useGrid } from './hooks';
import { Grid } from './components';
// import User from './User.jsx';
import Colors from './Colors.jsx';





export default memo(function App() {
  const { gridRef, post } = useGrid();
  const [color, setColor] = useState('');


  const handleColor = useCallback(val => {
    setColor(val);
  }, [setColor]);


  return (
    <div id="App">
      <div className="App--gridbox">
        <Grid
          gridRef={gridRef}
          post={post}
          color={color}
        />
      </div>
      <Colors
        userColor={color}
        handleColor={handleColor}
      />
    </div>
  );
});
