import React, { memo, useState, useRef, useCallback } from 'react';
import './App.css';
import { useGrid, useParams } from './hooks';
import { Grid, Colors, Cursors } from './components';








export default memo(function App() {
  const params = useParams();
  const gridRef = useRef(null);
  const [activeColor, setActiveColor] = useState(11);
  const [cursorMode, setCursorMode] = useState('drag');
  const [zoom, setZoom] = useState(1);

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
    const [setting, value] = id.split('-');
      console.log('setting, cursor', setting, value)
    if (setting === 'cursor') {
      console.log('set cursor', value)
      return setCursorMode(value);
    } else if (setting === 'zoom') {
      return setZoom(value)
      console.log('set zoom', value)
    };
    // setCursorMode(cursor);
  }, [setCursorMode, setZoom]);




  return (
    <div className="App">


      <div className="Toolbar">
        <Colors
          palette={colors}
          activeColor={activeColor}
          setColor={handleColorClick}
        />
        <Cursors
          cursorMode={cursorMode}
          click={handleToolClick}
        />
      </div>



      <Grid
        gridRef={gridRef}
        dimen={dimen}
        cursorMode={cursorMode}
      />
    {/*
    <div className="test">
    </div>



        <div className="c">
        </div>


      <div className="Grid">
        i am grid
      </div>




    */}
    </div>
  );
});









  // const ItemRenderer = ({ style, data, key, rowIndex, columnIndex } = {}) => {

  //   const cel = data[rowIndex * width + columnIndex];
  //   // const cel = data[rowIndex * width + columnIndex];
  //   // console.log('cel', cel)
  //   style = {
  //     backgroundColor: colors[cel.color],
  //     // backgroundColor: colors[data.color],
  //     ...style,
  //   };

  //   return (
  //     <div style={style}>
  //     </div>
  //   );
  // };

  // console.log('window.innerWidth', window.innerHeight)

  // const gridProps = {
  //   columnCount: dimen.width,
  //   columnWidth: 50,
  //   height: window.innerHeight,
  //   rowCount: dimen.height,
  //   rowHeight: 50,
  //   width: window.innerWidth,
  //   itemKey: itemKey,
  //   itemData: data,
  // };




// import { FixedSizeGrid } from 'react-window';

//   const { width, height } = dimen;



// function itemKey({ columnIndex, data, rowIndex }) {
//   // Find the item for the specified indices.
//   // In this case "data" is an Array that was passed to Grid as "itemData".
//   const item = data[rowIndex * width + columnIndex];

//   // Return a value that uniquely identifies this item.
//   // For a grid, this key must represent both the row and column.
//   // Typically this will be something dynamic like a UID for the row,
//   // Mixed with something more static like the incoming column index.
//   return `${item.id}`;
// }


// {data.length && (

//         <FixedSizeGrid {...gridProps}>
//           {ItemRenderer}
//         </FixedSizeGrid>


// )}


      // <canvas id="CANV"
      //   ref={canvasRef}
      //   width={128}
      //   height={72}
      // />
