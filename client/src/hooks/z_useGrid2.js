import React, { Fragment, memo, useState, useEffect, useRef, useCallback } from 'react';
import { d3, parse } from '../libs';
import { useSocket } from './';



function addGridClasses(params) {
  const { colors, width, height } = params;
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '';
  colors.forEach((d, i) => {
    style.innerHTML += `.f-${i} { background-color: ${d}; }\n`;
  });
  for (let c = 0; c < width; c++) {
    style.innerHTML += `.c-${c} { grid-column: ${c + 1}; }\n`;
  };
  for (let r = 0; r < height; r++) {
    style.innerHTML += `.r-${r} { grid-row: ${r + 1}; }\n`;
  };
  // console.log(style)

  document.getElementsByTagName('head')[0].appendChild(style);
};





// const GridCel = memo(({ id, col, row, color }) => {
//   return <div
//     id={id}
//     className={`GridCel c-${col} r-${row} f-${color}`}
//   />
// })






const GridCel = memo(({ id, cl } = {}) => <div id={id} className={cl} />);


const GridChildren = ({ sliceRows = [], sliceCols = [], allChildren = [] } = {}) => {
   return allChildren.slice(...sliceRows).map(d => d.slice(...sliceCols)).flat()
};





function makeGridCels(width, height) {
  return new Array(+height).fill(new Array(+width).fill(''));
};



// function updateGridCels(data, cels) {
//   data.forEach(d => {
//     const { cel_id: id, col, row, current: { color } } = d;
//     const props = { id, cl: `GridCel c-${col} r-${row} f-${color}`};
//     cels[row][col] = <GridCel key={id} {...props} />
//   });
//   return cels;
// };







export default function useGrid({ params, gridRef, canvasRef, activeColor, cursorMode } = {}) {

  const gridCels = useRef([]);


  useEffect(() => {
    console.log('first effect', params)
    if (params && !gridCels.current.length) {
      console.log('first effect made cels')
      addGridClasses(params);
      gridCels.current = makeGridCels(params.width, params.height)
    }
  }, [params, gridCels]);







///////////////////////////////////////
// Socket
///////////////////////////////////////

  const [redrawFlag, setRedrawFlag] = useState(false);
  const [celQueue, setCelQueue] = useState(null);
  const [lastDraw, setLastDraw] = useState(0);
  const dataRef = useRef(null);




  const updateGridCels = useCallback((data) => {
    data.forEach(d => {
      const { cel_id: id, col, row, current: { color } } = d;
      const props = { id, cl: `GridCel c-${col} r-${row} f-${color}`};
      gridCels.current[row][col] = <GridCel key={id} {...props} />;
    });
  }, [gridCels]);



  const handleUpdateGrid = useCallback(newGrid => {
    dataRef.current = newGrid
    // gridCels.current = updateGridCels(dataRef.current, gridCels.current)
    updateGridCels(dataRef.current);
    setRedrawFlag(true);
  }, [dataRef, updateGridCels, setRedrawFlag]);


  // const handleUpdateGrid = useCallback(newGrid => {
  //   dataRef.current = newGrid;
  //   setRedrawFlag(true);
  // }, [dataRef, setRedrawFlag]);




  const handleUpdateCel = useCallback(newCel => {
    const { _id, current } = newCel;
    const cel = dataRef.current[_id];
    cel.current = current;
    setCelQueue(cel);
  }, [dataRef, setCelQueue]);


  const handleUpdateLastDraw = useCallback(timestamp => {
    setLastDraw(timestamp);
  }, [setLastDraw]);


  const handleSocketMessage = useCallback(({ type, payload }) => {
    switch (type) {
      case 'update_grid':
        handleUpdateGrid(payload);
        break;
      case 'update_cel':
        handleUpdateCel(payload);
        break;
      case 'update_last_draw':
        handleUpdateLastDraw(payload);
        break;
      default:
        console.log('Socket --- Unhandled Message in useGrid:', type, payload);
        return null;
    };
  }, [handleUpdateGrid, handleUpdateCel, handleUpdateLastDraw]);


  const { active, post, username, postUsername } = useSocket(handleSocketMessage);


  useEffect(() => {   // get grid data from socket
    // console.log('EFFECT 1')
    if (params && active && !dataRef.current) {
      // console.log('EFFECT 1 -- get grid data from socket')
      post('get_grid');
    };
  }, [dataRef, params, active, post]);



///////////////////////////////////////
// D3 Node assign
///////////////////////////////////////

  const gridNodeRef = useRef(null);
  const tooltipNodeRef = useRef(null);


  useEffect(() => {   // assign grid ref to d3 node
    // console.log('EFFECT 2')
    const el = gridRef.current;
    if (el && !gridNodeRef.current) {
      // console.log('EFFECT 2 -- assign grid ref to d3 node')
      gridNodeRef.current = d3.select(el);
    };
  }, [gridRef, gridNodeRef]);


  useEffect(() => {   // assign tooltip ref to d3 node
    // console.log('EFFECT 3')
    if (!tooltipNodeRef.current) {
      // console.log('EFFECT 3 -- assign grid ref to d3 node')
      tooltipNodeRef.current = d3.select('body')
        .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);
    };
  }, [tooltipNodeRef]);



///////////////////////////////////////
// D3 -- Draw stack
///////////////////////////////////////

  const drawGrid = useCallback(() => {
    const data = dataRef.current;
    const node = gridNodeRef.current;
    if (!data || !node) {
      return null;
    };


// makeGridCels(data, params.width, params.height)


    node.selectAll('div')
      .data(data, d => d.cel_id)
      .enter()
        .append('div')
        .attr('id', d => d.cel_id)
        // .attr('class', 'GridCel')
        .attr('class', d => `GridCel c-${d.col} r-${d.row} f-${d.current.color}`)
        // .style('grid-column', d => d.col + 1)
        // .style('grid-row', d => d.row + 1)
        // .style('background-color', d => params.colors[d.current.color])
      .exit()
        .remove();

    setRedrawFlag(false);
  }, [params, dataRef, gridNodeRef, setRedrawFlag]);


  const drawCel = useCallback((cel) => {
    const node = gridNodeRef.current;
    if (!cel || !node) {
      return null;
    };

    node.select(`#${cel.cel_id}`)
      .datum(cel, d => d.cel_id)
        .style('background-color', d => params.colors[d.current.color]);

    setCelQueue(null);
  }, [params, gridNodeRef, setCelQueue]);


  const drawTooltip = useCallback(({ x, y, name, time }) => {
    const node = tooltipNodeRef.current;
    if (!node) {
      return null;
    };

    node
      .html(`<h4>${name}</h4><h5>${time}</h5>`)
      .style('left', x + 'px')
      .style('top', y + 'px')
      .style('opacity', 1);
  }, [tooltipNodeRef]);


  const undrawTooltip = useCallback(() => {
    const node = tooltipNodeRef.current;
    if (!node) {
      return null;
    };

    node
      .html('')
      .style('opacity', 0)
  }, [tooltipNodeRef]);



///////////////////////////////////////
// Event handlers + registration
///////////////////////////////////////

  const handleClick = useCallback(e => {
    if (cursorMode !== 'paint') {
      return null;
    };
    const { id } = e.target;
    const color = activeColor;
    if (!id || !~activeColor) {
      return null;
    };
    post('set_cel', { cel_id: id, color, t: Date.now() });
  }, [cursorMode, activeColor, post]);


  const handleMouseMove = useCallback(e => {
    const data = dataRef.current;
    if (!data) {
      return null;
    };
    const { clientX: x, clientY: y, target: { id } } = e;
    const datum = data.find(a => a.cel_id === id);
    if (!datum) {
      return null;
    };
    const { user_name, timestamp } = datum.current;
    if (!user_name) {
      return undrawTooltip();
    };
    drawTooltip({
      x,
      y,
      name: user_name,
      time: parse.time(Date.now() - timestamp),
    });
  }, [dataRef, drawTooltip, undrawTooltip]);


  useEffect(() => {   // add click listener to grid element
    // console.log('EFFECT 4')
    const el = gridRef.current;
    if (el) {
      // console.log('EFFECT 4 -- add click listener to grid element')
      el.addEventListener('click', handleClick);
    };

    return () => {
      // console.log('EFFECT 4 return -- remove click listener from grid element')
      if (el) {
        el.removeEventListener('click', handleClick);
      };
    };
  }, [gridRef, handleClick]);


  useEffect(() => {   // add mousemove listener to grid element
    // console.log('EFFECT 5')
    const el = gridRef.current;
    if (el) {
      // console.log('EFFECT 5 -- add mousemove listener to grid element')
      el.addEventListener('mousemove', handleMouseMove, { passive: true });
    };

    return () => {
      // console.log('EFFECT 5 -- remove mousemove listener from grid element')
      el.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gridRef, handleMouseMove]);





///////////////////////////////////////
// CANVAS --- WIP
///////////////////////////////////////

  const ctxRef = useRef(null);

  useEffect(() => {
    console.log('canvaseffect')
    if (canvasRef.current && !ctxRef.current) {
      console.log('have canvas', canvasRef.current)
      ctxRef.current = canvasRef.current.getContext('2d');
      ctxRef.current.imageSmoothingEnabled = false;
    };
  }, [canvasRef, ctxRef]);


  const drawCanvas = useCallback(() => {
    const data = dataRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !data) {
      return null;
    };
    const { colors } = params;
    const rgba = colors.map(d => {
      const hex = d.substr(1).split('').map(d => `${d}${d}`);
      const [r, g, b] = hex.map(d => parseInt(d, 16));
      return [r, g, b, 255];
    });

    const arr = new Uint8ClampedArray(data.length * 4);
    data.forEach((d, i) => {
      let startI = i * 4;
      const [r, g, b, a] = rgba[d.current.color];
      arr[startI++] = r;
      arr[startI++] = g;
      arr[startI++] = b;
      arr[startI++] = a;
    });

    let imageData = new ImageData(arr, 128);
    ctx.putImageData(imageData, 0, 0);
  }, [dataRef, ctxRef, params])


  useEffect(() => {
    if (redrawFlag) {
      drawCanvas();
    };
  }, [redrawFlag, celQueue, drawCanvas]);





///////////////////////////////////////
// Draw trigger effects
///////////////////////////////////////

  // useEffect(() => {   // draw full grid
  //   // console.log('EFFECT 6')
  //   if (redrawFlag) {
  //     // console.log('EFFECT 6 -- draw full grid')
  //     drawGrid();
  //   };
  // }, [redrawFlag, drawGrid]);


  // useEffect(() => {   // draw single cel
  //   // console.log('EFFECT 7')
  //   if (celQueue) {
  //     // console.log('EFFECT 7 -- draw single cel')
  //     drawCel(celQueue);
  //   };
  // }, [celQueue, drawCel]);





  // const [children, setChildren] = useState([])


  useEffect(() => {   // draw full grid
    // console.log('EFFECT 6')
    if (redrawFlag) {
      // return setChildren();
      // console.log('grid', )gridCels.current.forEach(d => console.log(d))
      gridCels.current.forEach(d => console.log(d.key))
      console.log(dataRef.current.length)

      dataRef.current.reduce((acc, d, i) => {
        const { cel_id } = d;
        if (!acc.find(d => d === cel_id)) {
          acc.push(cel_id)
        } else {
          console.error('DUPLICATE!!!', cel_id, i)
        }
        return acc;
      }, []);

      console.log(gridCels.current.length)
      // console.log('EFFECT 6 -- draw full grid')
      // drawGrid();
    };
  }, [redrawFlag, gridCels]);






  return {
    username,
    postUsername,
    children: GridChildren({
      sliceRows: [0, 5],
      sliceCols: [0, 5],
      allChildren: gridCels.current,
    })
    // gridCels: children,
    // lastDraw,
  };
};
