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
    Update + Modify
*/

const protoUser = (t) => ({
  name: 'anonymous',
  date_created: t,
  last_update: 0,
  last_login: t,
  last_logout: 0,
  history: [],
});


function create() {
  const uuid = UUID();
  if (!Users[uuid]) {
    Users[uuid] = protoUser(Date.now());
  } else {
    console.error('User already exists! ---', uuid);
  };
  return uuid;
};


function get(uuid) {
  if (!uuid) {
    return null;
  };
  return Users[uuid] || null;
};



function login(uuid) {
  if (!uuid) {
    return null;
  };
  const user = get(uuid);
  if (!user) {
    return null;
  };
  user.last_login = Date.now();
  return user.uuid;
};


function logout(uuid) {
  if (!uuid) {
    return null;
  };
  const user = get(uuid);
  user.last_logout = Date.now();
  user.history.push([
    user.last_login,
    user.last_logout,
  ]);
};





// function update(uuid, params) {
//   const user = Users[uuid]
//   if (!user) {
//     return null;
//   };
//   const { name } = params;

// };





// /*
//     Backup
// */

// const backupInterval = +process.env.BACKUP_INTERVAL;
// let backupTimeout = setTimeout(backup, backupInterval);

// async function backup() {
//   console.log('backupRan')
//   const dbFile = path.join(__dirname, 'db_grid.json');
//   await fs.writeFile(dbFile, JSON.stringify(GRID, null, 2), 'utf-8');
//   backupTimeout = setTimeout(backup, backupInterval);
// };




module.exports = {
  create,
  login,
  logout,
  // update,
};
