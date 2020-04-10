const Db = require('./Db');
const Grid = require('./Grid.js');
const User = require('./User.js');





const GlobalState = {};



GlobalState.Init = async () => {
  console.log('Init GlobalState...');
  try {
    const current = await Db.get('current');
    const params = await Db.get('params');
    Object.assign(Grid, { current, params });
    const users = await Db.get('users');
    Object.assign(User, { users });
    return true;
  } catch (err) {
    console.error('Init GlobalState ---', err);
    throw err;
  };
};





module.exports = GlobalState;
