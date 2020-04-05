import { useState, useEffect, useRef, useCallback } from 'react';
import { d3 } from '../libs';
import { palette } from '../global';
import { useSocket } from './';





function parseTime(ms) {
  const formatOutput = (val, unit) => {
    const floor = Math.floor(val);
    return `${floor} ${unit}${(floor > 1) ? 's' : ''} ago`;
  };

  const seconds = ms * 1e-3
  if (seconds < 60) {
    return formatOutput(seconds, 'second');
  };
  const minutes = seconds / 60;
  if (minutes < 60) {
    return formatOutput(minutes, 'minute');
  };
  const hours = minutes / 60;
  if (hours < 24) {
    return formatOutput(hours, 'hour');
  };
  const days = hours / 24;
  return formatOutput(days, 'day');
};




export default function useGrid() {
  const [color, setColor] = useState('');
  const dataRef = useRef(null);
  const gridRef = useRef(null);
  const gridNodeRef = useRef(null);

  // const tooltipRef = useRef(null);
  const tooltipNodeRef = useRef(null);






  useEffect(() => {   // assign grid ref to d3 node
    const el = gridRef.current;
    if (el && !gridNodeRef.current) {
      gridNodeRef.current = d3.select(el);
    };
  }, [gridRef, gridNodeRef]);


  useEffect(() => {   // assign tooltip ref to d3 node
    if (!tooltipNodeRef.current) {
      tooltipNodeRef.current = d3.select('body')
        .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);
    };
  }, [tooltipNodeRef]);










/*
    d3 draw stack
*/

  // const showTooltip = useCallback((d, left, top) => {
  //   const node = tooltipNodeRef.current;
  //   if (!node) {
  //     return null;
  //   };

  //   const { id, author, lastChangeTime } = d;

  //   node
  //     .html(`cel id: ${id}<br/>author: ${author}`)
  //     .style('left', left + 'px')
  //     .style('top', top + 'px')
  //     .style('opacity', 1);

  //   // console.log("drawTooltip", d, left, top)
  // }, [tooltipNodeRef]);


  const showTooltip = useCallback((e) => {
    const node = tooltipNodeRef.current;
    const data = dataRef.current;
    if (!node || !data) {
      return null;
    };

    const { clientX, clientY, target } = e;
    const { id } = target;

    const datum = data.find(a => a.id === id)
    const { lastChangeAuthor, lastChangeTime } = datum;
    const deltaTime = parseTime(Date.now() - lastChangeTime);
    const displayText = lastChangeAuthor
      ? `<h4>${lastChangeAuthor}</h4><h5>${deltaTime}</h5>`
      : '<h4>blank</h4>'

    node
      .html(displayText)
      .style('left', clientX + 'px')
      .style('top', clientY + 'px')
      .style('opacity', !!lastChangeAuthor ? 1 : 0);

  }, [dataRef, tooltipNodeRef]);






  const hideTooltip = useCallback((d, e) => {
    const node = tooltipNodeRef.current;
    if (!node) {
      return null;
    };
  }, [tooltipNodeRef]);







  const drawGrid = useCallback(() => {
    const data = dataRef.current;
    const node = gridNodeRef.current;
    if (!data || !node) {
      return null;
    };

    node.selectAll('div')
      .data(data, d => d.id)
        // .attr('id', d => d.id)
        // .attr('class', 'GridCel')
        // .style('left', d => d.col * 30 + 'px')
        // .style('top', d => d.row * 30 + 'px')
        // .style('background-color', d => palette[d.color])
      .enter()
        .append('div')
        .attr('id', d => d.id)
        .attr('class', 'GridCel')
        .style('left', d => d.col * 30 + 'px')
        .style('top', d => d.row * 30 + 'px')
        .style('background-color', d => palette[d.color])
        // .on('mouseover', function(d) {
        //   const { offsetLeft, offsetTop } = this;
        //   const { clientLeft, clientTop } = this;
        //   // showTooltip(d, offsetLeft, offsetTop)
        //   showTooltip(d, clientLeft, clientTop)
        //   // console.log('mousover in d3', this)
        //   console.dir(this)
        // })
        // .on('mouseover', showTooltip)
        // .on('mouseout', hideTooltip)
      // .exit()
      //   .remove();
  }, [dataRef, gridNodeRef, showTooltip, hideTooltip]);



  const drawCel = useCallback((cel) => {
    const node = gridNodeRef.current;
    if (!cel || !node) {
      return null;
    };

    node.select(`#${cel.id}`)
      .datum(cel, d => d.id)
        .style('background-color', d => palette[d.color]);
  }, [gridNodeRef]);



/*
    socket message handlers
*/

  const handleUpdateGrid = useCallback(newGrid => {
    dataRef.current = newGrid;
    drawGrid();
  }, [dataRef, drawGrid]);

  const handleUpdateCel = useCallback(newCel => {
    const data = dataRef.current;
    const index = data.findIndex(a => a.id === newCel.id);
    data[index] = newCel;
    drawCel(data[index]);
  }, [dataRef, drawCel]);



/*
    socket connection
*/

  const handleSocketMessage = useCallback(({ type, payload }) => {
    switch (type) {
      case 'update_grid':
        handleUpdateGrid(payload);
        break;
      case 'update_cel':
        handleUpdateCel(payload);
        break;
      case 'update_last_draw':
        // handle last draw
        console.log('lastDraw', payload)
        break;
      default:
        console.log('SOCKET message in useDraw', type, payload);
        return null;
    };
  }, [handleUpdateGrid, handleUpdateCel]);

  const { active, post, username } = useSocket(handleSocketMessage);




  useEffect(() => {   // get grid data from socket
    const data = dataRef.current;
    if (!data && active) {
      post('get_grid');
    };
  }, [dataRef, active, post]);


  const handleGridClick = useCallback(e => {
    const { id } = e.target;
    if (!id || !color) {
      return null;
    };
    post('set_cel', { id, color, t: Date.now() });
  }, [post, color]);


  useEffect(() => {   //add click listener to grid element
    const el = gridRef.current;
    if (el) {
      el.addEventListener('click', handleGridClick);
    };

    return () => {
      el.removeEventListener('click', handleGridClick);
    };
  }, [gridRef, handleGridClick]);




  useEffect(() => {   //add click listener to grid element
    const el = gridRef.current;

    // const handleHover = e => {
    //   console.log('hovered', e.target.id)
    // }

    if (el) {
      el.addEventListener('mousemove', showTooltip, { passive: true });
    };

    return () => {
      el.removeEventListener('mousemove', showTooltip);
    };
  }, [gridRef, showTooltip]);




  useEffect(() => {   // draw initial grid
    const data = dataRef.current;
    const node = gridNodeRef.current;
    if (data && node) {
      drawGrid();
    };
  }, [dataRef, gridNodeRef, drawGrid]);


  return {
    gridRef,
    username,
    color,
    setColor,
  };
};
