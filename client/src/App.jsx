import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { palette } from './global';
import { d3 } from './libs';
import { Grid } from './components';
import User from './User.jsx';
import Colors from './Colors.jsx';





function useSocket(cb = null) {
  const client = useRef(null);
  const [open, setOpen] = useState(false);
  const [uuid, setUuid] = useState(null);


  const handleOpen = useCallback(() => {
    if (client.current.readyState === 1) {
      setOpen(true);
    };
  }, [client, setOpen]);

  const handleClose = useCallback(() => {
    if (client.current.readyState === 3) {
      setOpen(false);
    };
  }, [client, setOpen]);


  const checkUuid = useCallback(() => {
    const storedUuid = localStorage.getItem('uuid');
    const msg = { type: 'check_uuid', payload: storedUuid };
    client.current.send(JSON.stringify(msg));
  }, [client]);

  const storeUuid = useCallback(val => {
    localStorage.setItem('uuid', val);
    setUuid(val);
  }, [setUuid]);


  const handleMessage = useCallback(msg => {
    const { type, payload } = JSON.parse(msg.data);
    // console.log('useSocket got message', type, payload)

    switch (type) {
      case 'check_uuid':
        checkUuid();
        break;
      case 'store_uuid':
        storeUuid(payload);
        break;
      default:
        cb({ type, payload });
        return null;
    };
  }, [checkUuid, storeUuid, cb]);


  useEffect(() => {
    if (!client.current) {
      const loc = window.location;
      let socketURI;
      if (loc.protocol === 'https:') {
        socketURI = 'wss:';
      } else {
        socketURI = 'ws:';
      };
      socketURI += '//' + loc.host;
      socketURI += loc.pathname;

      if (process.env.NODE_ENV === 'development') {
        socketURI = 'ws://localhost:8080';
      };

      client.current = new WebSocket(socketURI);
      client.current.onopen = handleOpen;
      client.current.onclose = handleClose;
      client.current.onmessage = handleMessage;
    };
  }, [client, handleOpen, handleClose, handleMessage]);


  const postMessage = useCallback((type, payload) => {
    if (!open || !uuid) {
      return null;
    };
    client.current.send(JSON.stringify({ type, payload, uuid }));
  }, [open, uuid, client]);


  return {
    active: open && !!uuid,
    post: postMessage,
  };
};








function useGrid() {
  const dataRef = useRef(null);
  const gridRef = useRef(null);
  const nodeRef = useRef(null);


  useEffect(() => {
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


  return {
    gridRef,
    post,
  };
};





export default memo(function App() {
  const { gridRef, post } = useGrid();
  const [color, setColor] = useState('');


  const handleColor = useCallback(val => {
    setColor(val);
  }, [setColor]);


  return (
    <div id="App">
      <div className="App--gridbox">
        <Grid
          gridRef={gridRef}
          post={post}
          color={color}
        />
      </div>
      <Colors
        userColor={color}
        handleColor={handleColor}
      />
    </div>
  );
});
