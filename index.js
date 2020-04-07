require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const WebSocket = require('ws');





// DB

const {
  Db,
  Grid,
  User,
  GlobalState,
} = require('./db');



// SERVER + PORT

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || process.argv[2] || 8080;



// MIDDLEWARE

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));



// WEBSOCKET

const socketServer = new WebSocket.Server({
  server: server,
});


function socketDispatchAll(type, payload) {
  socketServer.clients.forEach(socket => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    };
  });
};


function socketPostMessage(socket) {
  return (type, payload) => socket.send(JSON.stringify({ type, payload }));
};


function socketHandleConnection(socket) {
  const postMessage = socketPostMessage(socket);

  socket.on('message', msg => {
    const { type, payload, uuid } = JSON.parse(msg);
    // console.log('socket got message', type, uuid, payload)

    switch (type) {
      case 'check_uuid':
        const userLogin = User.login(payload);
        if (userLogin) {
          postMessage('store_user', userLogin);
        };
        break;
      case 'set_name':
        const userName = User.saveName(payload);
        if (userName) {
          postMessage('store_user', userName);
        };
        break;
      case 'get_grid':
        postMessage('update_grid', Grid.current);
        break;
      case 'set_cel':
        if (!User.canDraw(uuid)) {
          postMessage('too_soon');
          break;
        };
        const name = User.getName(uuid);
        const cel = Grid.update({ ...payload, uuid, name });
        if (cel) {
          socketDispatchAll('update_cel', cel);
          const lastDraw = User.didDraw(uuid);
          postMessage('update_last_draw', lastDraw);
        };
        break;
      default:
        console.log('Socket --- Unhandled Message:', type);
        return null;
    };
  });

  postMessage('request_uuid');
};


socketServer.on('connection', socketHandleConnection);



// CLIENT ROUTES

app.get('/params', (req, res) => {
  try {
    return res.status(200).json(Grid.params);
  } catch (err) {
    console.error('app.get(/params) --- ', err);
    return res.status(404).end();
  };
});
// app.use('*', express.static(process.env.NODE_ENV === 'production' ? 'public' : 'client/build'));
// app.use('*', express.static(
//   process.env.NODE_ENV === 'production'
//     ? path.join(__dirname, 'client', 'build')
//     : path.join(__dirname, 'public')
// ));

app.use('/', express.static(path.join(__dirname, 'client', 'build')));
app.use('/*', express.static(path.join(__dirname, 'client', 'build')));
app.use('*', express.static(path.join(__dirname, 'client', 'build')));


// STARTUP

console.log('Starting up...');
Db.Connect()
  // .then(ok => GlobalState.reset(false))
  .then(ok => GlobalState.Init())
  .then(ok => {
    server.listen(port, '0.0.0.0', () => {
      console.log('listening on', port);
    });
  })
  .catch(err => console.error('Startup Error!!! ---', err));



// SHUTDOWN

function shutdown(sig) {
  console.log(`\n${sig} signal received!`)
  console.log('Shutting down...');
  return Db.Close()
    .then(ok => {
      console.log('Close Server...');
      return server.close(() => {
        console.log('Bye')
        return process.exit(0);
      });
    })
    .catch(err => {
      console.error('Shutdown Error!!! ---', err);
      process.exit(1);
    });
};

process.on('SIGINT', shutdown);
// process.on('SIGTERM', shutdown);
