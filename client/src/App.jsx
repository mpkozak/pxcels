import React, { memo, useState, useRef, useCallback } from 'react';
import './App.css';
import { useGrid, useParams } from './hooks';
import { Grid, Colors } from './components';





export default memo(function App() {
  const params = useParams();
  const gridRef = useRef(null);
  const [activeColor, setActiveColor] = useState(11);
  const [cursorMode, setCursorMode] = useState('drag');

  useGrid({ gridRef, params, activeColor, cursorMode });

  const { colors, ...dimen } = params || {};


  const handleColorClick = useCallback(e => {
    const { id } = e.target;
    if (!id) {
      return null;
    };
    const color = +id.split('-')[1];
    setActiveColor(color);
    setCursorMode('paint');
  }, [setActiveColor, setCursorMode]);


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
        palette={colors}
        activeColor={activeColor}
        setColor={handleColorClick}
      />
      <div className="Tools" onClick={handleToolClick}>
        {['drag', 'paint'].map(d =>
          <div
            key={`tool-${d}`}
            id={`tool-${d}`}
            className={`Tools--button button ${d}${cursorMode === d ? ' active' : ''}`}
          />
        )}
      </div>
    </div>
  );
});

      // <canvas id="CANV"
      //   ref={canvasRef}
      //   width={128}
      //   height={72}
      // />
