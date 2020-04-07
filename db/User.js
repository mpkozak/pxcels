const Db = require('./Db.js');
const UUID = require('uuid').v4;





const User = {};


User.backupInterval = process.env.USER_BACKUP_INTERVAL * 1e3;
User.backupFlag = false;

User.backup = async () => {
  try {
    if (!User.backupFlag) {
      return;
    };
    User.backupFlag = false;
    const { users } = User;
    await Db.update('users', { users });
    // console.log('User.backup --- OK');
  } catch (err) {
    console.error('User.backup ---', err);
  } finally {
    User.backupTimeout = setTimeout(User.backup, User.backupInterval);
    return;
  };
};

User.backupTimeout = setTimeout(User.backup, User.backupInterval);


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

User.getName = (uuid) => {
  const user = User.get(uuid);
  if (!user) {
    return 'anonymous';
  };
  return user.name;
};


User.protoUser = (t) => ({
  name: 'anonymous',
  date_created: t,
  last_draw: 0,
  last_login: 0,
  last_logout: 0,
  history: [],
});

User.create = () => {
  const uuid = UUID();
  if (User.exists(uuid)) {
    console.error('User already exists! ---', uuid);
    return User.users[uuid];
  };
  const user = User.protoUser(Date.now());
  User.users[uuid] = user;
  User.backupFlag = true;
  return uuid;
};


User.didDraw = (uuid) => {
  const user = User.get(uuid);
  if (!user) {
    return false;
  };
  user.last_draw = Date.now();
  User.backupFlag = true;
  return user.last_draw;
};

User.saveName = (uuid, name) => {
  const user = User.get(uuid);
  if (!user || (typeof name !== string)) {
    return null;
  };
  user.name = name;
  User.backupFlag = true;
  return {
    uuid,
    name: user.name,
  };
};


User.login = (clientUuid) => {
  let uuid = clientUuid;
  if (!User.exists(clientUuid)) {
    uuid = User.create();
  };
  const user = User.get(uuid);
  user.last_login = Date.now();
  User.backupFlag = true;
  return {
    uuid,
    name: user.name,
  };
};

User.logout = (clientUuid) => {
  if (!User.exists(clientUuid)) {
    return null;
  };
  const user = User.get(clientUuid);
  user.last_logout = Date.now();
  user.history.push([
    user.last_login,
    user.last_logout,
  ]);
  return true;
};





module.exports = User;
