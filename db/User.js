const fs = require('fs').promises;
const path = require('path');
const UUID = require('uuid').v4;





/*
    Initialization
*/

const Users = init();

function init() {
  try {
    var users = require('./db_user.json');
  } catch (err) {
    console.error('No User backup available!');
    users = {};
  } finally {
    return users;
  };
};





/*
    GET
*/

function exists(uuid) {
  if (!uuid || !(uuid in Users)) {
    return false;
  };
  return true;
};


function get(uuid) {
  if (!exists(uuid)) {
    return undefined;
  };
  return Users[uuid];
};


function canDraw(uuid) {
  const user = get(uuid);
  if (!user) {
    return false;
  };
  const throttle = process.env.USER_THROTTLE * 1e3;
  const elapsed = Date.now() - user.last_draw;
  if (elapsed <= throttle) {
    return false;
  };
  return true;
};


function getName(uuid) {
  const user = get(uuid);
  if (!user) {
    return 'anonymous';
  };
  return user.name;
};




/*
    POST
*/

const protoUser = (t) => ({
  name: 'anonymous',
  date_created: t,
  last_draw: 0,
  last_login: 0,
  last_logout: 0,
  history: [],
});


function create() {
  const uuid = UUID();
  if (exists(uuid)) {
    console.error('User already exists! ---', uuid);
    return Users[uuid];
  };
  const user = protoUser(Date.now());
  Users[uuid] = user;
  return uuid;
};





/*
    PUT
*/

function didDraw(uuid) {
  const user = get(uuid);
  if (!user) {
    return false;
  };
  user.last_draw = Date.now();
  return user.last_draw;
};


function saveName(uuid, name) {
  const user = get(uuid);
  if (!user || (typeof name !== string)) {
    return null;
  };
  user.name = name;
  return {
    uuid,
    name: user.name,
  };
};





/*
    AUTH
*/

function login(clientUuid) {
  let uuid = clientUuid;
  if (!exists(clientUuid)) {
    uuid = create();
  };
  const user = get(uuid);
  user.last_login = Date.now();
  return {
    uuid,
    name: user.name,
  };
};


function logout(clientUuid) {
  if (!exists(clientUuid)) {
    return null;
  };
  const user = get(clientUuid);
  user.last_logout = Date.now();
  user.history.push([
    user.last_login,
    user.last_logout,
  ]);
  return true;
};






/*
    Backup
*/

const backupInterval = process.env.USER_BACKUP_INTERVAL * 1e3;
let backupTimeout = setTimeout(backup, backupInterval);

async function backup() {
  console.log('user backup ran')
  const dbFile = path.join(__dirname, 'db_user.json');
  const data = JSON.stringify(Users, null, 2);
  await fs.writeFile(dbFile, data, 'utf-8');
  backupTimeout = setTimeout(backup, backupInterval);
  return;
};





module.exports = {
  login,
  logout,
  saveName,
  getName,
  canDraw,
  didDraw,
};
