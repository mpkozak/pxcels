const { MongoClient, ObjectID } = require('mongodb');
const Grid = require('./Grid.js');
const User = require('./User.js');





///////////////////////////////////////
// Connection
///////////////////////////////////////

const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.PASS}@cluster0-eujzt.mongodb.net/test?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useUnifiedTopology: true });
let db;


const ConnectDb = () => new Promise((res, rej) => {
  console.log('ConnectDb...');
  client.connect(async (err, client) => {
    if (err) {
      rej(err);
      return;
    };
    db = client.db('grid');
    await GlobalState();
    console.log('ConnectDb --- OK');
    res(db);
  });
});


const CloseDb = () => {
  client.close();
};





///////////////////////////////////////
// INTERFACE
///////////////////////////////////////

const Db = {};


///////////////////////////////////////
// GET

Db.get = async (collection) => {
  try {
    const src = db.collection(collection);
    const entries = await src.find().toArray();
    const obj = entries.reduce((acc, { _id, data }) => {
      acc[_id] = data;
      return acc;
    }, {});
    return obj;
  } catch (err) {
    console.error('Db.getCollection ---', err);
    return false;
  };
};


///////////////////////////////////////
// PUT

Db.update = async (collection, data) => {
  try {
    const toUpdate = db.collection(collection);
    Object.entries(data).forEach(async ([key, data]) => {
      await toUpdate.replaceOne({ _id: key }, { data });
    });
    return true;
  } catch (err) {
    console.error('Db.update ---', err);
    return false;
  };
};


///////////////////////////////////////
// reset

Db.seed = async (collection, data) => {
  try {
    const toSeed = db.collection(collection);
    Object.entries(data).forEach(async ([key, data]) => {
      await toSeed.insertOne({ _id: key, data });
    });
    console.log('Db.seed --- OK', collection);
    return true;
  } catch (err) {
    console.error('Db.seed ---', err);
    return false;
  };
};


Db.purge = async (collection) => {
  try {
    const toDelete = db.collection(collection);
    await toDelete.deleteMany({});
    console.log('Db.purge --- OK', collection);
    return true;
  } catch (err) {
    console.error('Db.purge ---', err);
    return false;
  };
};

///////////////////////////////////////





///////////////////////////////////////
// Global State --- GRID
///////////////////////////////////////

// const Grid = {};


// Grid.backupInterval = process.env.GRID_BACKUP_INTERVAL * 1e3;
// Grid.backupFlag = false;

// Grid.backup = async () => {
//   try {
//     if (!Grid.backupFlag) {
//       return;
//     };
//     Grid.backupFlag = false;
//     const { current, history, params } = Grid;
//     await Db.update('grid', { current, history, params });
//     console.log('Grid.backup --- OK');
//   } catch (err) {
//     console.error('Grid.backup ---', err);
//   } finally {
//     Grid.backupTimeout = setTimeout(Grid.backup, Grid.backupInterval);
//     return;
//   };
// };

// Grid.backupTimeout = setTimeout(Grid.backup, Grid.backupInterval);


// Grid.update = ({ id, color, t, uuid, name }) => {
//   const celIndex = Grid.current.findIndex(a => a.id === id);
//   const cel = Grid.current[celIndex];
//   if (!cel) {
//     return null;
//   };
//   cel.color = color;
//   cel.lastChangeUuid = uuid;
//   cel.lastChangeAuthor = name;
//   cel.lastChangeTime = t;
//   Grid.history.push(cel);
//   Grid.backupFlag = true;
//   return { cel, celIndex };
// };


// Grid.protoGrid = () => {
//   return ({
//     current: [],
//     history: [],
//     params: {
//       width: process.env.GRID_WIDTH || 128,
//       height: process.env.GRID_HEIGHT || 72,
//       colors: [
//         '#000',
//         '#008',
//         '#00F',
//         '#800',
//         '#808',
//         '#80F',
//         '#F00',
//         '#F08',
//         '#F0F',
//         '#080',
//         '#088',
//         '#08F',
//         '#880',
//         '#888',
//         '#88F',
//         '#F80',
//         '#F88',
//         '#F8F',
//         '#0F0',
//         '#0F8',
//         '#0FF',
//         '#8F0',
//         '#8F8',
//         '#8FF',
//         '#FF0',
//         '#FF8',
//         '#FFF',
//       ],
//     },
//   });
// };

// Grid.reset = () => {
//   const grid = protoGrid();
//   for (let row = 0; row < grid.params.height; row++) {
//     for (let col = 0; col < grid.params.width; col++) {
//       grid.current.push({
//         id: `c${col}r${row}`,
//         col,
//         row,
//         color: 26,
//         lastChangeUuid: '',
//         lastChangeAuthor: '',
//         lastChangeTime: Date.now(),
//       });
//     };
//   };
//   return grid;
// };





///////////////////////////////////////
// Global State --- USER
///////////////////////////////////////

// const User = {}


// User.backupInterval = process.env.USER_BACKUP_INTERVAL * 1e2;
// User.backupFlag = false;

// User.backup = async () => {
//   try {
//     if (!User.backupFlag) {
//       return;
//     };
//     User.backupFlag = false;
//     const { users } = User;
//     await Db.update('users', { users });
//     console.log('User.backup --- OK');
//   } catch (err) {
//     console.error('User.backup ---', err);
//   } finally {
//     User.backupTimeout = setTimeout(User.backup, User.backupInterval);
//     return;
//   };
// };

// User.backupTimeout = setTimeout(User.backup, User.backupInterval);


// User.exists = (uuid) => {
//   if (!uuid || !(uuid in User.users)) {
//     return false;
//   };
//   return true;
// };

// User.get = (uuid) => {
//   if (!User.exists(uuid)) {
//     return undefined;
//   };
//   return User.users[uuid];
// };

// User.canDraw = (uuid) => {
//   const user = User.get(uuid);
//   if (!user) {
//     return false;
//   };
//   const throttle = process.env.USER_THROTTLE * 1e3;
//   const elapsed = Date.now() - user.last_draw;
//   if (elapsed <= throttle) {
//     return false;
//   };
//   return true;
// };

// User.getName = (uuid) => {
//   const user = User.get(uuid);
//   if (!user) {
//     return 'anonymous';
//   };
//   return user.name;
// };


// User.protoUser = (t) => ({
//   name: 'anonymous',
//   date_created: t,
//   last_draw: 0,
//   last_login: 0,
//   last_logout: 0,
//   history: [],
// });

// User.create = () => {
//   const uuid = UUID();
//   if (User.exists(uuid)) {
//     console.error('User already exists! ---', uuid);
//     return User.users[uuid];
//   };
//   const user = User.protoUser(Date.now());
//   User.users[uuid] = user;
//   User.backupFlag = true;
//   return uuid;
// };


// User.didDraw = (uuid) => {
//   const user = User.get(uuid);
//   if (!user) {
//     return false;
//   };
//   user.last_draw = Date.now();
//   User.backupFlag = true;
//   return user.last_draw;
// };

// User.saveName = (uuid, name) => {
//   const user = User.get(uuid);
//   if (!user || (typeof name !== string)) {
//     return null;
//   };
//   user.name = name;
//   User.backupFlag = true;
//   return {
//     uuid,
//     name: user.name,
//   };
// };


// User.login = (clientUuid) => {
//   let uuid = clientUuid;
//   if (!User.exists(clientUuid)) {
//     uuid = User.create();
//   };
//   const user = User.get(uuid);
//   user.last_login = Date.now();
//   User.backupFlag = true;
//   return {
//     uuid,
//     name: user.name,
//   };
// };

// User.logout = (clientUuid) => {
//   if (!User.exists(clientUuid)) {
//     return null;
//   };
//   const user = User.get(clientUuid);
//   user.last_logout = Date.now();
//   user.history.push([
//     user.last_login,
//     user.last_logout,
//   ]);
//   return true;
// };





///////////////////////////////////////
// Global State
///////////////////////////////////////

// async function GlobalState() {
//   console.log('GlobalState...');
//   try {
//     const forGrid = await Db.get('grid');
//     Object.assign(Grid, forGrid);
//     const users = await Db.get('users');
//     Object.assign(User, { users });
//     console.log('GlobalState --- OK');
//     return true;
//   } catch (err) {
//     console.error('GlobalState ---', err);
//     throw err;
//   };
// };


// async function GlobalReset(local = false) {
//   try {
//     Grid.backupFlag = false;
//     User.backupFlag = false;
//     await purgeRemote();
//     if (local) {
//       await pushLocal();
//     } else {
//       await pushTemplate();
//     };
//     console.log('Global Reset --- OK');
//     return true;
//   } catch (err) {
//     console.error('Global Reset ---', err);
//     throw err;
//   };
// };


// async function purgeRemote() {
//   await Db.purge('grid');
//   await Db.purge('users');
//   return true;
// };

// async function pushLocal() {
//   const grid = require('./_local/db_grid.json');
//   const users = require('./_local/db_users.json');
//   await Db.seed('grid', grid);
//   await Db.seed('users', users);
//   return true;
// };

// async function pushTemplate() {
//   const grid = Grid.reset();
//   const users = require('./_local/db_users.json');
//   await Db.seed('grid', grid);
//   await Db.seed('users', users);
//   return true;
// };






///////////////////////////////////////
// Export
///////////////////////////////////////

module.exports = {
  ConnectDb,
  CloseDb,
  Db,
  Grid,
  User,
};
