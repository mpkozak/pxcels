require('dotenv').config();
const path = require('path');
const http = require('http');
const cors = require('cors');
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

app.use(cors());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));



// WEBSOCKET

const socketServer = new WebSocket.Server({
  server: server,
});


function socketDispatchAll(action, payload) {
  socketServer.clients.forEach(socket => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action, payload }));
    };
  });
};


function socketHandleMessage(msg) {
    const { action, payload, uuid, login } = JSON.parse(msg);

    if (login) {
      // console.log('Logging in user:', login);
      return User.login(login)
        .then(userLogin => {
          if (userLogin) {
            this.uuid = userLogin.uuid;
            this.username = userLogin.name;
            this.post('store_user', userLogin);
          };
        })
        .catch(err => console.error('res_uuid', err));
    };

    if (!uuid || (uuid && this.uuid !== uuid)) {
      console.log('Invalid UUID with request from:', this.uuid);
      return this.post('req_uuid');
    };

    // console.log('socket got message', action, payload, uuid);

    switch (action) {
      case 'get_grid':
        this.post('update_grid', Grid.current);
        break;
      case 'set_cel':
        if (!User.canDraw(uuid)) {
          this.post('too_soon');
          break;
        };
        const cel = Grid.update({ ...payload, uuid, name: this.username });
        if (cel) {
          socketDispatchAll('update_cel', cel);
          User.didDraw(uuid)
            .then(lastDraw => this.post('update_last_draw', lastDraw))
            .catch(err => console.error('set_cel', err))
        };
        break;
      case 'set_name':
        User.saveName(uuid, payload)
          .then(userName => {
            if (userName) {
              this.username = userName.name;
              this.post('store_user', userName);
            };
          })
          .catch(err => console.error('set_name', err))
        break;
      default:
        console.log('Socket --- Unhandled Message:', action);
        return null;
    };
};


function socketHandleConnection(socket) {
  socket.post = (action, payload) => socket.send(JSON.stringify({ action, payload }));
  socket.uuid = null;
  socket.on('message', socketHandleMessage);
  socket.post('req_uuid');
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

const client = express.static(
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'public')
    : path.join(__dirname, 'client', 'build')
);

app.use('/', client);
app.use('/*', client);
app.use('*', client);



// STARTUP

console.log('Starting up...');
Db.Connect()
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
  clearTimeout(Grid.backupTimeout);
  clearTimeout(User.backupTimeout);
  Db.Close()
    .then(ok => {
      console.log('Close Server...');
      server.close(() => {
        console.log('Bye')
        process.exit(0);
      });
    })
    .catch(err => {
      console.error('Shutdown Error!!! ---', err);
      process.exit(1);
    })
};

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => process.on(signal, shutdown));
