const Db = require('./Db');
const Grid = require('./Grid.js');
const User = require('./User.js');





const GlobalState = {};


GlobalState.Init = async () => {
  console.log('Init GlobalState...');
  try {
    const forGrid = await Db.get('grid');
    Object.assign(Grid, forGrid);
    const users = await Db.get('users');
    Object.assign(User, { users });
    return true;
  } catch (err) {
    console.error('Init GlobalState ---', err);
    throw err;
  };
};


GlobalState.purgeRemote = async () => {
  await Db.purge('grid');
  await Db.purge('users');
  return true;
};

GlobalState.pushLocal = async () => {
  const grid = require('./_local/db_grid.json');
  const users = require('./_local/db_users.json');
  await Db.seed('grid', grid);
  await Db.seed('users', users);
  return true;
};

GlobalState.pushTemplate = async () => {
  const grid = Grid.reset();
  const users = {};
  await Db.seed('grid', grid);
  await Db.seed('users', users);
  return true;
};


GlobalState.reset = async (local = false) => {
  console.log('Reset GlobalState...');
  try {
    Grid.backupFlag = false;
    User.backupFlag = false;
    await GlobalState.purgeRemote();
    if (local) {
      await GlobalState.pushLocal();
    } else {
      await GlobalState.pushTemplate();
    };
    console.log('Reset GlobalState --- OK');
    return true;
  } catch (err) {
    console.error('Reset GlobalState ---', err);
    throw err;
  };
};





module.exports = GlobalState;
