import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
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
    console.log('useSocket got message', type, payload)

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
      console.log('useSocket initialize')

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
    client: client.current,
    active: open,
    uuid: uuid,
    post: postMessage,
  };
};





export default memo(function App() {
  const [name, setName] = useState('me');
  const [grid, setGrid] = useState([]);
  const [color, setColor] = useState('');




  const updateGrid = useCallback(payload => {
    const index = grid.findIndex(a => a.id === payload.id);
    const newGrid = [...grid];
    newGrid[index] = payload;
    setGrid(newGrid);
  }, [grid, setGrid]);


  const handleSocketMessage = useCallback(({ type, payload }) => {
    switch (type) {
      case 'grid':
        setGrid(payload);
        break;
      case 'cel':
        // console.log('socket cent cel', payload);
        updateGrid(payload);
        break;
      default:
        // console.log('socket sent:', type)
        return null;
    };
  }, [setGrid, updateGrid]);


  const { client, active, uuid, post } = useSocket(handleSocketMessage);



  useEffect(() => {
    if (!grid.length) {
      post('get_grid');
    };
  }, [grid, post])



  const handleName = useCallback(val => {
    setName(val);
  }, [setName]);


  const handleColor = useCallback(val => {
    setColor(val);
  }, [setColor]);


  return (
    <div id="App">
      <div className="App--gridbox">
        {active && (
          <Grid
            grid={grid}
            post={post}

            uuid={uuid}
            name={name}
            color={color}
            client={client}
          />
        )}
      </div>


      <Colors userColor={color} handleColor={handleColor} />



    </div>
  );
});


      // <div className="App--sidebar">
      //   <User username={name} handleName={handleName} />
      //   <Colors userColor={color} handleColor={handleColor} />
      // </div>



        // <div className="App--status">
        //   {active ? 'Active' : 'Connecting...'}
        //   <h4>{message}</h4>
        // </div>


        //
