import { useState, useEffect, useRef, useCallback } from 'react';
import { d3, parse } from '../libs';
import { useSocket } from './';





export default function useGrid({ params, gridRef, canvasRef, activeColor, cursorMode } = {}) {

///////////////////////////////////////
// Socket
///////////////////////////////////////

  const [redrawFlag, setRedrawFlag] = useState(false);
  const [celQueue, setCelQueue] = useState(null);
  const [lastDraw, setLastDraw] = useState(0);
  const dataRef = useRef(null);


  const handleUpdateGrid = useCallback(newGrid => {
    dataRef.current = newGrid;
    setRedrawFlag(true);
  }, [dataRef, setRedrawFlag]);


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

    node.selectAll('div')
      .data(data, d => d.cel_id)
      .enter()
        .append('div')
        .attr('id', d => d.cel_id)
        .attr('class', 'GridCel')
        .style('background-color', d => params.colors[d.current.color])
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


    // console.log("colors", rgba)

    // console.log('draw canvas')



  }, [dataRef, ctxRef, params])



  useEffect(() => {
    if (redrawFlag) {
      drawCanvas()
    }


  }, [redrawFlag, celQueue, drawCanvas])



  // const canvasRef = useRef(null);
  // const ctxRef = useRef(null);
  // const imageDataRef = useRef(null);

  // const drawCanvas = useCallback(() => {
  //   const data = dataRef.current;
  //   const ctx = ctxRef.current;
  //   if (!ctx || !data) {
  //     return null;
  //   };

  //   const rgb = {
  //     aqua: [0, 255, 255],
  //     black: [0, 0, 0],
  //     blue: [0, 0, 255],
  //     fuchsia: [255, 0, 255],
  //     gray: [128, 128, 128],
  //     green: [0, 128, 0],
  //     lime: [0, 255, 0],
  //     maroon: [128, 0, 0],
  //     navy: [0, 0, 128],
  //     olive: [128, 128, 0],
  //     purple: [128, 0, 128],
  //     red: [255, 0, 0],
  //     silver: [192, 192, 192],
  //     teal: [0, 128, 128],
  //     white: [255, 255, 255],
  //     yellow: [255, 255, 0],
  //   };

  //   const arr = new Uint8ClampedArray(data.length * 4);

  //   data.forEach((d, i) => {
  //     let startI = i * 4;
  //     const [r, g, b] = rgb[d.color];
  //     arr[startI++] = r;
  //     arr[startI++] = g;
  //     arr[startI++] = b;
  //     arr[startI++] = 255;
  //   });

  //   let imageData = new ImageData(arr, 128);

  //   data.forEach((d, i) => {
  //     let startI = i * 4;
  //     const [r, g, b] = rgb[d.color];
  //     arr[startI++] = r;
  //     arr[startI++] = g;
  //     arr[startI++] = b;
  //     arr[startI++] = 255;
  //   });

  //   ctx.putImageData(imageData, 0, 0);
  // }, [dataRef, ctxRef]);



  // useEffect(() => {   // initialize canvas context
  //   const canvas = canvasRef.current;
  //   if (canvas && !ctxRef.current) {
  //     ctxRef.current = canvas.getContext('2d');
  //   };
  // }, [canvasRef, ctxRef]);


  // useEffect(() => {   // initialize imageData
  //   const data = dataRef.current;
  //   if (data && !imageDataRef.current) {
  //     imageDataRef.current = new ImageData(128, 72);
  //   };
  // }, [dataRef, imageDataRef]);





///////////////////////////////////////
// Draw trigger effects
///////////////////////////////////////

  useEffect(() => {   // draw full grid
    // console.log('EFFECT 6')
    if (redrawFlag) {
      // console.log('EFFECT 6 -- draw full grid')
      drawGrid();
    };
  }, [redrawFlag, drawGrid]);


  useEffect(() => {   // draw single cel
    // console.log('EFFECT 7')
    if (celQueue) {
      // console.log('EFFECT 7 -- draw single cel')
      drawCel(celQueue);
    };
  }, [celQueue, drawCel]);





  return {
    username,
    postUsername,
    // lastDraw,
  };
};
