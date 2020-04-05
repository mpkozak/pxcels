import { useState, useEffect, useRef, useCallback } from 'react';
import { d3, parse } from '../libs';
import { palette } from '../global';
import { useSocket } from './';





export default function useGrid() {
  const [color, setColor] = useState('');
  const [lastDraw, setLastDraw] = useState(0);
  const dataRef = useRef(null);
  const gridRef = useRef(null);
  const gridNodeRef = useRef(null);

  const tooltipNodeRef = useRef(null);



/*
    d3 node assign
*/

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

  const showTooltip = useCallback((e) => {
    const node = tooltipNodeRef.current;
    const data = dataRef.current;
    if (!node || !data) {
      return null;
    };

    const { clientX, clientY, target: { id } } = e;

    const datum = data.find(a => a.id === id)
    const { lastChangeAuthor, lastChangeTime } = datum;
    const deltaTime = parse.time(Date.now() - lastChangeTime);
    const displayText = lastChangeAuthor
      ? `<h4>${lastChangeAuthor}</h4><h5>${deltaTime}</h5>`
      : '<h4>blank</h4>'

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


  const drawGrid = useCallback(() => {
    const data = dataRef.current;
    const node = gridNodeRef.current;
    if (!data || !node) {
      return null;
    };

    node.selectAll('div')
      .data(data, d => d.id)
      .enter()
        .append('div')
        .attr('id', d => d.id)
        .attr('class', 'GridCel')
        .style('left', d => d.col * 30 + 'px')
        .style('top', d => d.row * 30 + 'px')
        .style('background-color', d => palette[d.color])
      .exit()
        .remove();
  }, [dataRef, gridNodeRef ]);


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

  const handleUpdateLastDraw = useCallback(timestamp => {
    setLastDraw(timestamp);
  }, [setLastDraw]);



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
        handleUpdateLastDraw(payload);
        break;
      default:
        console.log('SOCKET message in useDraw', type, payload);
        return null;
    };
  }, [handleUpdateGrid, handleUpdateCel, handleUpdateLastDraw]);

  const { active, post, username } = useSocket(handleSocketMessage);


  useEffect(() => {   // get grid data from socket
    const data = dataRef.current;
    if (!data && active) {
      post('get_grid');
    };
  }, [dataRef, active, post]);



/*
    event handlers and registration
*/

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





/*
    WIP
*/

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


  useEffect(() => {   //add mousemove listener to grid element
    const el = gridRef.current;
    if (el) {
      el.addEventListener('mousemove', showTooltip, { passive: true });
    };

    return () => {
      el.removeEventListener('mousemove', showTooltip);
    };
  }, [gridRef, showTooltip]);





/*
    Initial draw effect
*/

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
    lastDraw,
    color,
    setColor,
  };
};
