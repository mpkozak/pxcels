import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Grid from './Grid.jsx';
import User from './User.jsx';
import Colors from './Colors.jsx';





function useSocket() {
  const client = useRef(null);
  const [active, setActive] = useState(false);


  const handleActive = useCallback(() => {
    console.log('handleActive')
    setActive(true);
  }, [setActive]);


  useEffect(() => {
    if (!client.current) {
      console.log('instantiating socket')
      client.current = new WebSocket('ws://192.168.0.3:8080');
      client.current.onopen = handleActive;
    };
  }, [client, handleActive]);


  return {
    client: client.current,
    active: active,
  };
};





export default memo(function App() {
  const { client, active } = useSocket();
  const [name, setName] = useState('me');
  const [color, setColor] = useState('');
  const [uuid, setUuid] = useState('');
  const [message, setMessage] = useState('');
  const [grid, setGrid] = useState([]);



  const updateGrid = useCallback(payload => {
    const index = grid.findIndex(a => a.id === payload.id);
    const newGrid = [...grid];
    newGrid[index] = payload;
    setGrid(newGrid);
  }, [grid, setGrid]);


  const handleSocketMessage = useCallback(msg => {
    const { type, payload } = JSON.parse(msg.data);

    switch (type) {
      case 'uuid':
        // console.log('socket sent uuid', payload)
        setUuid(payload);
        break;
      case 'message':
        // console.log('socket sent message', payload)
        setMessage(payload);
        break;
      case 'grid':
        // console.log('socket sent grid', payload)
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
  }, [setUuid, setMessage, setGrid, updateGrid]);


  useEffect(() => {
    if (client) {
      client.onmessage = handleSocketMessage;
    };
  }, [client, handleSocketMessage]);


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
            uuid={uuid}
            name={name}
            color={color}
            grid={grid}
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
