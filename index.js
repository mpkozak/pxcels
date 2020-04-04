const path = require('path');
const http = require('http');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

const WebSocket = require('ws');
const UUID = require('uuid').v4;



// SERVER + PORT

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || process.argv[2] || 8080;



// MIDDLEWARE

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));



// GRID

const gridWidth = 128;
const gridHeight = 72;
const GRID = [];

for (let row = 0; row < gridHeight; row++) {
  for (let col = 0; col < gridWidth; col++) {
    GRID.push({
      id: `c${col}r${row}`,
      col,
      row,
      color: 'white',
      lastChangeAuthor: '',
      lastChangeTime: Date.now(),
    });
  };
};


// function updateGrid(payload) {
//   const { id, color, author, time } = payload;
//   const cel = GRID.find(a => a.id === id);
//   cel.color = color;
//   cel.lastChangeAuthor = author;
//   cel.lastChangeTime = time;
//   socketDispatchAll('cel', cel);
//   // dispatchGrid();
// };



function handleSetCel({ id, color, t }, uuid) {
  const cel = GRID.find(a => a.id === id);
  cel.color = color;
  cel.lastChangeAuthor = uuid;
  cel.lastChangeTime = t;
  socketDispatchAll('update_cel', cel);
};






// function dispatchGrid() {
//   wss.clients.forEach(client => {
//     if (client.readyState === WebSocket.OPEN) {
//       const msg = {
//         type: 'grid',
//         payload: GRID,
//       };
//       client.send(JSON.stringify(msg));
//     };
//   });
// };


// function dispatchCel(cel) {
//   socketDispatchAll('cel', cel);
//   wss.clients.forEach(client => {
//     if (client.readyState === WebSocket.OPEN) {
//       const msg = {
//         type: 'cel',
//         payload: cel,
//       };
//       client.send(JSON.stringify(msg));
//     };
//   });
// };













// WEBSOCKET

const wss = new WebSocket.Server({
  server: server,
});


function socketDispatchAll(type, payload) {
  console.log('socketDispatchAll')
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, payload }));
    };
  });
};







wss.on('connection', ws => {
  let userID = undefined;

  const postMessage = (type, payload) => ws.send(JSON.stringify({ type, payload }));

  const handleCheckUuid = (payload) => {
    userID = payload || UUID();
    postMessage('store_uuid', userID);
  };

  ws.on('message', msg => {
    const { type, payload, uuid } = JSON.parse(msg);
    console.log('socket got message', type, uuid, payload)

    switch (type) {
      case 'check_uuid':
        handleCheckUuid(payload);
        break;
      case 'get_grid':
        postMessage('update_grid', GRID);
        break;
      case 'set_cel':
        handleSetCel(payload, uuid);
        break;
      default:
        console.log('UNKNOWN MESSAGE', type);
        return null;
    };
  });

  postMessage('check_uuid');
});










// let dingTimeout = undefined;

// const ding = () => {
//   const time = Date.now();
//   console.log('sending ding')
//   // wss.send(`The time is ${time}`);
//   console.log(wss.clients)

//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(`The time is ${time}`);
//     }
//   });


//   dingTimeout = setTimeout(ding, 1000);
// };

// ding();










// API ROUTES

// server.use('/api/media', express.static(path.join(__dirname, 'media')));
// server.use('/api', require('./api_static.js'));
// server.use('/api', require('./api_dynamic.js'));



// CLIENT ROUTES

app.use('/', express.static(path.join(__dirname, 'client', 'build')));
app.use('/*', express.static(path.join(__dirname, 'client', 'build')));
app.use('*', express.static(path.join(__dirname, 'client', 'build')));



// LISTEN

server.listen(port, '0.0.0.0', () => {
  console.log('listening on', port);
});
