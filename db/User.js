const Db = require('./Db.js');
const UUID = require('uuid').v4;





const User = {};


User.exists = (uuid) => {
  if (!uuid || !(uuid in User.users)) {
    return false;
  };
  return true;
};


User.get = (uuid) => {
  if (!User.exists(uuid)) {
    return undefined;
  };
  return User.users[uuid];
};


User.protoUser = (t) => ({
  name: 'anonymous',
  created: t,
  last_draw: 0,
  last_login: 0,
  last_logout: 0,
});


User.create = async () => {
  const uuid = UUID();
  if (User.exists(uuid)) {
    console.error('User already exists! ---', uuid);
    return User.users[uuid];
  };
  const user = User.protoUser(Date.now());
  await Db.insertOne('users', { _id: uuid, ...user });
  User.users[uuid] = user;
  return uuid;
};


User.login = async (clientUuid) => {
  let uuid = clientUuid;
  if (!User.exists(clientUuid)) {
    uuid = await User.create();
  };
  const user = User.get(uuid);
  const last_login = Date.now();
  await Db.updateOne('users', uuid, { last_login });
  user.last_login = last_login;
  return {
    uuid,
    name: user.name,
  };
};


User.getName = (uuid) => {
  const user = User.get(uuid);
  if (!user) {
    return 'anonymous';
  };
  return user.name;
};


User.canDraw = (uuid) => {
  const user = User.get(uuid);
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


User.didDraw = async (uuid) => {
  const user = User.get(uuid);
  if (!user) {
    return false;
  };
  const last_draw = Date.now();
  await Db.updateOne('users', uuid, { last_draw });
  user.last_draw = last_draw;
  return last_draw;
};


User.saveName = async (uuid, name) => {
  const user = User.get(uuid);
  if (!user || (typeof name !== 'string') || name.length >= 48) {
    return null;
  };
  await Db.updateOne('users', uuid, { name });
  user.name = name;
  return {
    uuid,
    name: user.name,
  };
};


// User.logout = (clientUuid) => {
//   if (!User.exists(clientUuid)) {
//     return null;
//   };
//   // const user = User.users[clientUuid];
//   const user = User.get(clientUuid);
//   user.last_logout = Date.now();
//   user.history.push([
//     user.last_login,
//     user.last_logout,
//   ]);
//   return true;
// };





module.exports = User;
