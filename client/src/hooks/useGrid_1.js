import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

  document.getElementsByTagName('head')[0].appendChild(style);
};





export default function useGrid({ params, gridRef, canvasRef, activeColor, cursorMode } = {}) {

  useEffect(() => {
    if (params) {
      addGridClasses(params);
    }
  }, [params]);





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
        .attr('class', d => `GridCel c-${d.col} r-${d.row} f-${d.current.color}`)
      .exit()
        .remove();

    setRedrawFlag(false);
  }, [dataRef, gridNodeRef, setRedrawFlag]);


  const drawCel = useCallback((cel) => {
    const node = gridNodeRef.current;
    if (!cel || !node) {
      return null;
    };

    node.select(`#${cel.cel_id}`)
      .datum(cel, d => d.cel_id)
        .attr('class', d => `GridCel c-${d.col} r-${d.row} f-${d.current.color}`);

    setCelQueue(null);
  }, [gridNodeRef, setCelQueue]);


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
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
      };
    };
  }, [gridRef, handleMouseMove]);





///////////////////////////////////////
// CANVAS --- WIP
///////////////////////////////////////

  const ctx = useRef(null);
  const offCanvas = useRef(null);
  const offCtx = useRef(null);


  useEffect(() => {   // set the onscreen canvas dimensions to match its display size; get context
    const canvas = canvasRef.current;
    if (params && canvasRef.current && !ctx.current) {
      // const { width, height } = params;
      // canvas.width = width * 8;
      // canvas.height = height * 8;
      // const { width, height } = canvas.getBoundingClientRect();
      // canvas.width = width * 4;
      // canvas.height = height * 4;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * 4;
      canvas.height = clientHeight * 4;
      ctx.current = canvas.getContext('2d');
      ctx.current.imageSmoothingEnabled = false;
    };
  }, [params, canvasRef, ctx]);


  useEffect(() => {   // create offscreen rendering canvas
    if (params && !offCanvas.current) {
      const { width, height } = params;
      if (typeof OffscreenCanvas !== 'undefined') {
        // console.log('OffscreenCanvas -- OK')
        offCanvas.current = new OffscreenCanvas(width, height);
      } else {
        // console.log('OffscreenCanvas -- NOT OK')
        offCanvas.current = document.createElement('canvas');
        offCanvas.current.width = width;
        offCanvas.current.height = height;
      };
      offCtx.current = offCanvas.current.getContext('2d');
    };
  }, [params, offCanvas, offCtx]);


  const readymades = useMemo(() => {
    if (!params) return null;
    const { colors } = params;
    const colorSquares = colors.map(d => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = d;
      ctx.fillRect(0, 0, 64, 64)
      return canvas;
    });
    return colorSquares;
  }, [params]);

  // const rgba = useMemo(() => {
  //   if (params) {
  //     return params.colors.map(d => {
  //       const hex = d.substr(1).split('').map(d => `${d}${d}`);
  //       const [r, g, b] = hex.map(d => parseInt(d, 16));
  //       return [r, g, b, 255];
  //     });
  //   };
  // }, [params]);





  // const drawCanvas = useCallback(() => {
  //   const data = dataRef.current;
  //   const cx = ctx.current;
  //   const { colors } = params;
  //   if (!data || !cx || !colors) {
  //     return null;
  //   };

  //   const scalar = 8;

  //   data.forEach(d => {
  //     const { row, col, current: { color } } = d;
  //     cx.fillStyle = colors[color];
  //     cx.fillRect(col * scalar, row * scalar, scalar, scalar);
  //   });

  //   // const cx = ctx.current;
  //   // console.log(cx)
  //   // cx.drawImage(offCanvas.current, 0, 0, cx.canvas.width, cx.canvas.height);
  // }, [dataRef, params, ctx]);



  // const drawCanvas = useCallback(() => {
  //   const data = dataRef.current;
  //   const cx = ctx.current;
  //   if (!data || !cx) {
  //     return null;
  //   };

  //   const scalar = 4;

  //   data.forEach(d => {
  //     const { row, col, current: { color } } = d;
  //     cx.drawImage(readymades[color], col * scalar, row * scalar, scalar, scalar);
  //   });

  //   // const cx = ctx.current;
  //   // console.log(cx)
  //   // cx.drawImage(offCanvas.current, 0, 0, cx.canvas.width, cx.canvas.height);
  // }, [dataRef, readymades, ctx]);




  const drawCanvas = useCallback(() => {
    const data = dataRef.current;
    if (!data) {
      return null;
    };
    const offCx = offCtx.current
    data.forEach(d => {
      const { row, col, current: { color } } = d;
      offCx.drawImage(readymades[color], col, row, 1, 1);
    });

    const cx = ctx.current;
    cx.drawImage(offCanvas.current, 0, 0, cx.canvas.width, cx.canvas.height);
  }, [dataRef, readymades, ctx, offCanvas, offCtx]);



  // const drawCanvas = useCallback(() => {
  //   const data = dataRef.current;
  //   if (!data) {
  //     return null;
  //   };
  //   const { colors } = params;

  //   const offCx = offCtx.current
  //   data.forEach(d => {
  //     const { row, col, current: { color } } = d;
  //     offCx.fillStyle = colors[color];
  //     offCx.fillRect(col, row, 1, 1);
  //   })

  //   const cx = ctx.current;
  //   console.log("in draw", cx)
  //   cx.drawImage(offCanvas.current, 0, 0, cx.canvas.width, cx.canvas.height);
  // }, [dataRef, params, ctx, offCanvas, offCtx]);





  // const drawCanvas = useCallback(() => {
  //   const data = dataRef.current;
  //   const c = ctx.current;
  //   if (!c || !data || !params) {
  //     return null;
  //   };
  //   const { colors, width, height } = params;
  //   const scalar = 100;

  //   // const ofsc = new OffscreenCanvas(width * scalar, height * scalar);
  //   const ofsc = document.createElement('canvas');
  //   ofsc.width = width * scalar;
  //   ofsc.height = height * scalar;
  //   const cx = ofsc.getContext('2d');
  //   // console.log('cx', cx)
  //   // console.log(ofsc)

  //   data.forEach(d => {
  //     const { row, col, current: { color } } = d;
  //     cx.fillStyle = colors[color];
  //     cx.fillRect(col * scalar, row * scalar, scalar, scalar);

  //     // cx.strokeStyle = 'black';
  //     // cx.lineWidth = 5;
  //     // cx.beginPath()
  //     // cx.rect(col * scalar, row * scalar, scalar, scalar);
  //     // cx.fill()
  //     // cx.stroke()
  //   })

  //   c.drawImage(ofsc, 0, 0, c.canvas.width, c.canvas.height);
  // }, [dataRef, ctx, params])




  // const drawCanvas = useCallback(() => {
  //   const data = dataRef.current;
  //   const cx = ctx.current;
  //   if (!ctx || !data) {
  //     return null;
  //   };
  //   const { colors } = params;
  //   const rgba = colors.map(d => {
  //     const hex = d.substr(1).split('').map(d => `${d}${d}`);
  //     const [r, g, b] = hex.map(d => parseInt(d, 16));
  //     return [r, g, b, 255];
  //   });

  //   const arr = new Uint8ClampedArray(data.length * 4);
  //   data.forEach((d, i) => {
  //     let startI = i * 4;
  //     const [r, g, b, a] = rgba[d.current.color];
  //     arr[startI++] = r;
  //     arr[startI++] = g;
  //     arr[startI++] = b;
  //     arr[startI++] = a;
  //   });

  //   let imageData = new ImageData(arr, 128);
  //   cx.putImageData(imageData, 0, 0);
  // }, [dataRef, ctx, params])




  useEffect(() => {
    if (redrawFlag && ctx.current) {
      drawCanvas();
    };
  }, [redrawFlag, celQueue, ctx, drawCanvas]);





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
