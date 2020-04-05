import { useEffect, useRef, useCallback } from 'react';
import { d3 } from '../libs';
import { palette } from '../global';
import { useSocket } from './';





export default function useGrid() {
  const dataRef = useRef(null);
  const gridRef = useRef(null);
  const nodeRef = useRef(null);


  useEffect(() => {
    const el = gridRef.current;
    if (el && !nodeRef.current) {
      nodeRef.current = d3.select(el);
    };
  }, [gridRef, nodeRef]);


  const drawGrid = useCallback(() => {
    const data = dataRef.current;
    const node = nodeRef.current;
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
      // .exit()
      //   .remove();
  }, [dataRef, nodeRef]);


  const drawCel = useCallback((cel) => {
    const node = nodeRef.current;
    if (!cel || !node) {
      return null;
    };

    node.select(`#${cel.id}`)
      .datum(cel, d => d.id)
        .style('background-color', d => palette[d.color]);
  }, [nodeRef]);


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
  //   draw();
  // }, [dataRef, draw]);


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

  const { active, post } = useSocket(handleSocketMessage);


  useEffect(() => {
    const data = dataRef.current;
    if (!data && active) {
      post('get_grid');
    };
  }, [dataRef, active, post]);


  useEffect(() => {
    const data = dataRef.current;
    const node = nodeRef.current;
    if (data && node) {
      drawGrid();
    };
  }, [dataRef, nodeRef, drawGrid]);


  return {
    gridRef,
    post,
  };
};
