import { useState, useEffect, useRef, useCallback } from 'react';
import { d3, parse } from '../libs';
import { useSocket } from './';





export default function useGrid(params) {
// console.log('useGrid')





///////////////////////////////////////
// D3 -- node assign
///////////////////////////////////////

  const gridRef = useRef(null);
  const gridNodeRef = useRef(null);
  const tooltipNodeRef = useRef(null);


  useEffect(() => {   // assign grid ref to d3 node
    // console.log('EFFECT 1')
    const el = gridRef.current;
    if (el && !gridNodeRef.current) {
      // console.log('EFFECT 1 -- assign grid ref to d3 node')
      gridNodeRef.current = d3.select(el);
    };
  }, [gridRef, gridNodeRef]);


  useEffect(() => {   // assign tooltip ref to d3 node
    // console.log('EFFECT 2')
    if (!tooltipNodeRef.current) {
      // console.log('EFFECT 2 -- assign grid ref to d3 node')
      tooltipNodeRef.current = d3.select('body')
        .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);
    };
  }, [tooltipNodeRef]);





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
    const { cel, celIndex } = newCel;
    dataRef.current[celIndex] = cel;
    setCelQueue(celIndex);
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


  const { active, post, username } = useSocket(handleSocketMessage);


  useEffect(() => {   // get grid data from socket
    // console.log('EFFECT 3')
    if (params && active && !dataRef.current) {
      // console.log('EFFECT 3 -- get grid data from socket')
      post('get_grid');
    };
  }, [dataRef, params, active, post]);





///////////////////////////////////////
// Color ref + click handler
///////////////////////////////////////

  const colorRef = useRef(26);


  const handleGridClick = useCallback(e => {
    const { id } = e.target;
    const color = colorRef.current;
    if (!id || !color) {
      return null;
    };
    post('set_cel', { id, color, t: Date.now() });
  }, [colorRef, post]);


  useEffect(() => {   // add click listener to grid element
    // console.log('EFFECT 4')
    const el = gridRef.current;
    if (el) {
      // console.log('EFFECT 4 -- add click listener to grid element')
      el.addEventListener('click', handleGridClick);
    };

    return () => {
      // console.log('EFFECT 4 return -- remove click listener to grid element')
      if (el) {
        el.removeEventListener('click', handleGridClick);
      };
    };
  }, [gridRef, handleGridClick]);





///////////////////////////////////////
// D3 -- Grid draw stack
///////////////////////////////////////

  const drawGrid = useCallback(() => {
    // console.log('DRAW GRID')
    const data = dataRef.current;
    const node = gridNodeRef.current;
    if (!data || !node) {
      return null;
    };

    // console.log('DRAW GRID --- draw is happening')
    node.selectAll('div')
      .data(data, d => d.id)
      .enter()
        .append('div')
        .attr('id', d => d.id)
        .attr('class', 'GridCel')
        // .style('')
        // .style('left', d => d.col * 30 + 'px')
        // .style('top', d => d.row * 30 + 'px')
        .style('background-color', d => params.colors[d.color])
      .exit()
        .remove();

    setRedrawFlag(false);
  }, [params, dataRef, gridNodeRef, setRedrawFlag]);


  const drawCel = useCallback((celIndex) => {
    // console.log('DRAW CEL')
    // const params = paramsRef.current;
    const cel = dataRef.current[celIndex];
    const node = gridNodeRef.current;
    if (!cel || !node) {
      return null;
    };

    // console.log('DRAW CEL --- draw is happening')
    node.select(`#${cel.id}`)
      .datum(cel, d => d.id)
        .style('background-color', d => params.colors[d.color]);

    setCelQueue(null);
  }, [params, gridNodeRef, setCelQueue]);








///////////////////////////////////////
// Tooltip WIP
///////////////////////////////////////

  const showTooltip = useCallback((e) => {
    const node = tooltipNodeRef.current;
    const data = dataRef.current;
    if (!node || !data) {
      return null;
    };

    const { clientX, clientY, target: { id } } = e;
    const datum = data.find(a => a.id === id);
    if (!datum) {
      return null;
    };
    const { lastChangeAuthor, lastChangeTime } = datum;
    const deltaTime = parse.time(Date.now() - lastChangeTime);
    const displayText = lastChangeAuthor
      ? `<h4>${lastChangeAuthor}</h4><h5>${deltaTime}</h5>`
      : '<h4>blank</h4>';

    node
      .html(displayText)
      .style('left', clientX + 'px')
      .style('top', clientY + 'px')
      .style('opacity', !!lastChangeAuthor ? 1 : 0);
  }, [dataRef, tooltipNodeRef]);


  // const hideTooltip = useCallback((d, e) => {
  //   const node = tooltipNodeRef.current;
  //   if (!node) {
  //     return null;
  //   };
  // }, [tooltipNodeRef]);


  // const tooltipRef = useRef({});

  // const updateTooltip = useCallback(currentId => {
  //   const { id } = tooltipRef.current;
  //   if (currentId === id) {
  //     console.log('data is the same')
  //     return null;
  //   };


  // }, [tooltipRef]);


  // const handleMouseMove = useCallback(e => {
  //   const { clientX, clientY, target: { id } } = e;
  //   //
  // })


  useEffect(() => {   // add mousemove listener to grid element
    const el = gridRef.current;
    if (el) {
      el.addEventListener('mousemove', showTooltip, { passive: true });
    };

    return () => {
      el.removeEventListener('mousemove', showTooltip);
    };
  }, [gridRef, showTooltip]);







///////////////////////////////////////
// CANVAS --- WIP
///////////////////////////////////////

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
// Draw stack effects
///////////////////////////////////////

  useEffect(() => {
    if (redrawFlag) {
      drawGrid();
    };
  }, [redrawFlag, drawGrid]);


  useEffect(() => {
    if (celQueue) {
      drawCel(celQueue);
    };
  }, [celQueue, drawCel]);



  return {
    gridRef,
    colorRef,
    // canvasRef,
    username,
    lastDraw,
  };
};
