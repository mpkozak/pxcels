const path = require('path');
const http = require('http');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

const WebSocket = require('ws');
const uuid = require('uuid').v4;



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


function updateGrid(payload) {
  const { id, color, author, time } = payload;
  const cel = GRID.find(a => a.id === id);
  cel.color = color;
  cel.lastChangeAuthor = author;
  cel.lastChangeTime = time;
  dispatchCel(cel)
  // dispatchGrid();
};


function dispatchGrid() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const msg = {
        type: 'grid',
        payload: GRID,
      };
      client.send(JSON.stringify(msg));
    };
  });
};


function dispatchCel(cel) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const msg = {
        type: 'cel',
        payload: cel,
      };
      client.send(JSON.stringify(msg));
    };
  });
};






// WEBSOCKET

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  const userID = uuid();

  ws.on('message', msg => {
    console.log('socket got message from ', userID)

    const { type, ...payload } = JSON.parse(msg);
    switch (type) {
      case 'message':
        // console.log('socket sent message', payload);
        break;
      case 'paint':
        // console.log('socket sent paint', payload);
        updateGrid(payload);
        break;
      default:
        console.log('socket sent:', type);
        return null;
    };
  });

  const msg = {
    type: 'uuid',
    payload: userID,
  };
  ws.send(JSON.stringify(msg));

  dispatchGrid();
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
