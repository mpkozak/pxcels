  // .then((db) => {   // purge
  //   Db.purge('grid');
  // })
  // .then((db) => {   // seed
  //   const { current, history, params } = Grid;
  //   Db.seed('grid', { current, history, params });
  // })
  // .then((db) => {   // get
  //   const grid = Db.get('grid');
  //   return grid;
  // })
  // .then(output => console.log('output', Object.keys(output)))
  // .then((db) => {   // update
  //   const { current, history, params } = Grid;
  //   Db.update('grid', { current, history, params });
  // })
  // .then(output => console.log('output', output))




// const Grid = require('./Grid.js');



  const fs = require('fs').promises;
  const path = require('path');



  const { current, history, ...params } = require('./z_json/z_db_grid.json');
  const dbFile = path.join(__dirname, '_local', 'db_grid.json');
  const data = JSON.stringify({ current, history, params }, null, 2);
  await fs.writeFile(dbFile, data, 'utf-8');


  const users = require('./z_json/z_db_user.json');
  const dbFile = path.join(__dirname, '_local', 'db_users.json');
  const data = JSON.stringify(users, null, 2);
  await fs.writeFile(dbFile, data, 'utf-8');
