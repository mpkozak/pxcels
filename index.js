require('dotenv').config();
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

const { Grid, User } = require('./db');



// User




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



function validateUser(uuid) {

}








wss.on('connection', ws => {
  let userID = undefined;


  const postMessage = (type, payload) => ws.send(JSON.stringify({ type, payload }));


  ws.on('message', msg => {
    const { type, payload, uuid } = JSON.parse(msg);
    console.log('socket got message', type, uuid, payload)

    switch (type) {
      case 'register':
        userID = User.create();
        postMessage('store_uuid', userID);
        break;
      case 'login':
        userID = User.login(payload)
        postMessage('store_uuid', userID);
        // handleLogin(payload);
        break;
      case 'get_grid':
        postMessage('update_grid', Grid.current);
        break;
      case 'set_cel':
        const cel = Grid.update({ ...payload, uuid });
        socketDispatchAll('update_cel', cel);
        break;
      default:
        console.log('UNKNOWN MESSAGE', type);
        return null;
    };
  });

  postMessage('request_uuid');
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
