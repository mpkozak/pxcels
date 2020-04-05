import { useEffect, useRef, useCallback } from 'react';
import { d3 } from '../libs';
import { palette } from '../global';
import { useSocket } from './';





export default function useGrid() {
  const dataRef = useRef(null);
  const gridRef = useRef(null);
  const nodeRef = useRef(null);


  useEffect(() => {
    console.log('assign noderef')
    const el = gridRef.current;
    if (el && !nodeRef.current) {
      nodeRef.current = d3.select(el);
    };
  }, [gridRef, nodeRef]);


  const draw = useCallback(() => {
    const data = dataRef.current;
    const node = nodeRef.current;
    if (!data || !node) {
      return null;
    };

    node.selectAll('div')
      .data(data, d => d.id)
        .attr('id', d => d.id)
        .attr('class', 'Grid--cel')
        .style('left', d => d.col * 30 + 'px')
        .style('top', d => d.row * 30 + 'px')
        .style('background-color', d => palette[d.color])
      .enter()
        .append('div')
        .attr('id', d => d.id)
        .attr('class', 'Grid--cel')
        .style('left', d => d.col * 30 + 'px')
        .style('top', d => d.row * 30 + 'px')
        .style('background-color', d => palette[d.color])
      .exit()
        .remove();
  }, [dataRef, nodeRef]);


  const updateCel = useCallback(newCel => {
    const data = dataRef.current;
    const index = data.findIndex(a => a.id === newCel.id);
    data[index] = newCel;
    draw();
  }, [dataRef, draw]);


  const updateGrid = useCallback(newGrid => {
    dataRef.current = newGrid;
    draw();
  }, [dataRef, draw]);


  const handleSocketMessage = useCallback(({ type, payload }) => {
    switch (type) {
      case 'update_cel':
        updateCel(payload);
        break;
      case 'update_grid':
        updateGrid(payload);
        break;
      default:
        console.log('UNKNOWN MESSAGE', type, payload);
        return null;
    };
  }, [updateGrid, updateCel]);

  const { active, post } = useSocket(handleSocketMessage);


  useEffect(() => {
    const data = dataRef.current;
    if (!data && active) {
      post('get_grid');
    };
  }, [dataRef, active, post]);


  useEffect(() => {
    console.log('draw effect')
    const data = dataRef.current;
    const node = nodeRef.current;
    if (data && node) {
      draw();
    };
  }, [dataRef, nodeRef, draw]);


  return {
    gridRef,
    post,
  };
};
