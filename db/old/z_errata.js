const fs = require('fs').promises;
const path = require('path');




GlobalState.InitLocal = async () => {
  console.log('Init GlobalState from Local...');
  try {
    const forGrid = require('./_local/db_grid.json');
    const users = require('./_local/db_users.json');
    Object.assign(Grid, forGrid);
    Object.assign(User, { users });
    return true;
  } catch (err) {
    console.error('Init GlobalState from Local ---', err);
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


GlobalState.saveToLocal = async () => {
  try {
    console.log('writing grid to file...')
    const { current, history, params } = Grid;
    const gridData = { current, history, params };
    const gridJson = JSON.stringify(gridData, null, 2);
    const gridFile = path.join(__dirname, '_local', 'db_grid.json');
    await fs.writeFile(gridFile, gridJson, 'utf-8');

    console.log('writing users to file...')
    const { users } = User;
    const usersData = users;
    const usersJson = JSON.stringify(usersData, null, 2);
    const usersFile = path.join(__dirname, '_local', 'db_users.json');
    await fs.writeFile(usersFile, usersJson, 'utf-8');

    return true;
  } catch (err) {
    console.error('saveToLocal ---', err);
    throw err;
  }
};




// User.backupInterval = process.env.USER_BACKUP_INTERVAL * 1e3;
// User.backupFlag = false;

// User.backup = async () => {
//   try {
//     if (!User.backupFlag) {
//       return;
//     };
//     User.backupFlag = false;
//     const { users } = User;
//     await Db.update('users', { users });
//     // console.log('User.backup --- OK');
//   } catch (err) {
//     console.error('User.backup ---', err);
//   } finally {
//     User.backupTimeout = setTimeout(User.backup, User.backupInterval);
//     return;
//   };
// };

// User.backupTimeout = setTimeout(User.backup, User.backupInterval);



Grid.protoGrid = () => {
  return ({
    current: [],
    history: [],
    params: {
      width: process.env.GRID_WIDTH || 128,
      height: process.env.GRID_HEIGHT || 72,
      colors: [
        '#000',
        '#008',
        '#00F',
        '#800',
        '#808',
        '#80F',
        '#F00',
        '#F08',
        '#F0F',
        '#080',
        '#088',
        '#08F',
        '#880',
        '#888',
        '#88F',
        '#F80',
        '#F88',
        '#F8F',
        '#0F0',
        '#0F8',
        '#0FF',
        '#8F0',
        '#8F8',
        '#8FF',
        '#FF0',
        '#FF8',
        '#FFF',
      ],
    },
  });
};

Grid.reset = () => {
  const grid = Grid.protoGrid();
  for (let row = 0; row < grid.params.height; row++) {
    for (let col = 0; col < grid.params.width; col++) {
      grid.current.push({
        id: `c${col}r${row}`,
        col,
        row,
        color: 26,
        lastChangeUuid: '',
        lastChangeAuthor: '',
        lastChangeTime: Date.now(),
      });
    };
  };
  return grid;
};




// Db.get = async (collKey) => {
//   try {
//     const { coll, model } = Db._collections[collKey];
//     const data = await model(coll);
//     return data;
//   } catch (err) {
//     console.error('Db.getCollection ---', err);
//     return false;
//   };
// };





// Db.__collections = {
//   _fake:'',
//   current: {},
//   // history: {{}, {}},
//   params: [
//     {  },
//     { projection: { _id: 0 } },
//   ],
// }





// Db.get = async (collection) => {
//   try {
//     const src = Db._db.collection(collection);
//     const entries = await src.find().toArray();
//     const obj = entries.reduce((acc, { _id, data }) => {
//       acc[_id] = data;
//       return acc;
//     }, {});
//     return obj;
//   } catch (err) {
//     console.error('Db.getCollection ---', err);
//     return false;
//   };
// };


// Db.getCollection = async (collectionName) => {
//   try {
//     const collection = Db._db.collection(collectionName);
//     const entries = await collection.find().toArray();
//     console.log("entries", entries)
//     // const obj = entries.reduce((acc, { _id, data }) => {
//     //   acc[_id] = data;
//     //   return acc;
//     // }, {});
//     return entries;
//   } catch (err) {
//     console.error('Db.getCollection ---', err);
//     return false;
//   };
// };




  // const collection = Db._db.collection('current');

  // Db.objectifyCollection(arr)







// Db.seed = async (collection, data) => {
//   try {
//     const toSeed = Db._db.collection(collection);
//     Object.entries(data).forEach(async ([key, data]) => {
//       await toSeed.insertOne({ _id: key, data });
//     });
//     console.log('Db.seed --- OK', collection);
//     return true;
//   } catch (err) {
//     console.error('Db.seed ---', err);
//     return false;
//   };
// };


// Db.purge = async (collection) => {
//   try {
//     const toDelete = Db._db.collection(collection);
//     await toDelete.deleteMany({});
//     console.log('Db.purge --- OK', collection);
//     return true;
//   } catch (err) {
//     console.error('Db.purge ---', err);
//     return false;
//   };
// };



Db.getCollectionAsArray = async (collectionName) => {
  try {
    const collection = Db._db.collection(collectionName);
    const arr = await collection.find().toArray();
    return arr;
  } catch (err) {
    return false;
  };
};


Db.getCollectionAsObject = async (collectionName) => {
  try {
    const arr = await Db.getCollectionAsArray(collectionName);
    const obj = arr.reduce((acc, { _id, ...content }) => {
      acc[_id] = content;
      return acc;
    }, {});
    return obj;
  } catch (err) {
    console.error('Db.getCollectionAsObject ---', err);
    return false;
  };
};


Db.getDocumentAsObject = async (collectionName, documentId) => {
  try {
    const collectionObj = await Db.getCollectionAsObject(collectionName);
    const obj = collectionObj[documentId];
    return obj;
  } catch (err) {
    console.error('Db.getDocumentAsObject ---', err);
    return false;
  };
};


Db.getGrid = async () => {
  try {
    const collection = Db._db.collection('current');
    const entries = await collection.find().toArray();
    const data = entries.reduce((acc, { _id, ...content }) => {
      acc[_id] = content;
      return acc;
    }, {});



    return entries;



  } catch (err) {
    console.error('db error', err)
  };
};


// Db.getGrid = async () => {
//   try {

//   } catch (err) {
//     console.error('db error', err)
//   };
// };





Db.doThis = async () => {
  try {
    console.log('do this')
    const { current } = require('./_local/db_grid.json');
    const coll = Db._db.collection('current');
    await coll.deleteMany({});
    console.log('deleted')
    const curr = current.map((d, i) => {
      const { id, col, row, color, lastChangeUuid, lastChangeAuthor, lastChangeTime } = d;
      const newSeed = {
        _id: i,
        cel_id: id,
        col: col,
        row: row,
        current: {
          color: color,
          user_uuid: lastChangeUuid,
          user_name: lastChangeAuthor,
          timestamp: lastChangeTime,
        },
      };
      return { insertOne: { document: { ...newSeed } } };
    });
    console.log('new', curr)
    const done = await coll.bulkWrite(curr);
    console.log(done)
    console.log("done")



  } catch (err) {
    console.error(err)
  } finally {
    console.log('all done')
    return true;
  };
};







// reseed current
    // await Db._db.createCollection('current');



    // const prom = curr.map(d => coll.insertOne({ ...d }));
    // const done = await Promise.all(prom);


// reseed history
    // await Db._db.createCollection('history');
    // const coll = Db._db.collection('history');
    // await coll.deleteMany({});
    // const hist = data.map(d => {
    //   const { id, col, row, color, lastChangeUuid, lastChangeAuthor, lastChangeTime } = d;
    //   const newSeed = {
    //     cel_id: id,
    //     timestamp: lastChangeTime,
    //     color: color,
    //     user_uuid: lastChangeUuid,
    //     user_name: lastChangeAuthor,
    //   };
    //   return newSeed;
    // }).sort((a, b) => a.timestamp - b.timestamp);
    // const prom = hist.map(d => coll.insertOne({ ...d }));
    // const done = await Promise.all(prom);


// reseed params
    // await Db._db.createCollection('params');
    // const coll = Db._db.collection('params');
    // await coll.deleteMany({})
    // const params = {
    //   _id: 'data',
    //   width: process.env.GRID_WIDTH || 128,
    //   height: process.env.GRID_HEIGHT || 72,
    //   colors: [
    //     '#000',
    //     '#008',
    //     '#00F',
    //     '#800',
    //     '#808',
    //     '#80F',
    //     '#F00',
    //     '#F08',
    //     '#F0F',
    //     '#080',
    //     '#088',
    //     '#08F',
    //     '#880',
    //     '#888',
    //     '#88F',
    //     '#F80',
    //     '#F88',
    //     '#F8F',
    //     '#0F0',
    //     '#0F8',
    //     '#0FF',
    //     '#8F0',
    //     '#8F8',
    //     '#8FF',
    //     '#FF0',
    //     '#FF8',
    //     '#FFF',
    //   ],
    // };
    // const done = await Db._db.collection('params').insertOne({ ...params });







// Db._collectionKeys = [
//   'current',
//   'history',
//   'params',
//   'users',
// ];

    // model: c => c.find().toArray(),


    // model: c => c.findOne({ _id: 'data' }, { projection: { _id: 0 } }),
    // test1: function(arg) {
    //   console.log('test1', arg, this)
    // },
    // test2: (arg) => console.log('test2', arg, this),
    // test3: {
    //   test3a: function(arg) {
    //     console.log('test3a', arg, this)
    //   },
    //   test3b: (arg) => console.log('test3b', arg, this),
    // }













module.exports = Db;








// const { MongoClient } = require('mongodb');





// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-eujzt.mongodb.net/test?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useUnifiedTopology: true });





// const Db = {};


// Db.Connect = async () => {
//   console.log('Connect Db...');
//   try {
//     const db = await new Promise((res, rej) => {
//       client.connect(async (err, client) => {
//         if (err) {
//           rej(err);
//         };
//         const db = client.db('grid');
//         res(db);
//       });
//     });
//     Db._db = db;
//     return true;
//   } catch (err) {
//     console.error('Connect Db ---', err);
//     throw err;
//   };
// };

// Db.Close = async () => {
//   console.log('Close Db...');
//   try {
//     await client.close();
//     return true;
//   } catch (err) {
//     console.error('Close Db ---', err);
//     throw err;
//   };
// };


// Db.get = async (collection) => {
//   try {
//     const src = Db._db.collection(collection);
//     const entries = await src.find().toArray();
//     const obj = entries.reduce((acc, { _id, data }) => {
//       acc[_id] = data;
//       return acc;
//     }, {});
//     return obj;
//   } catch (err) {
//     console.error('Db.getCollection ---', err);
//     return false;
//   };
// };


// Db.update = async (collection, data) => {
//   try {
//     const toUpdate = Db._db.collection(collection);
//     Object.entries(data).forEach(async ([key, data]) => {
//       await toUpdate.replaceOne({ _id: key }, { data });
//     });
//     return true;
//   } catch (err) {
//     console.error('Db.update ---', err);
//     return false;
//   };
// };


// Db.seed = async (collection, data) => {
//   try {
//     const toSeed = Db._db.collection(collection);
//     Object.entries(data).forEach(async ([key, data]) => {
//       await toSeed.insertOne({ _id: key, data });
//     });
//     console.log('Db.seed --- OK', collection);
//     return true;
//   } catch (err) {
//     console.error('Db.seed ---', err);
//     return false;
//   };
// };


// Db.purge = async (collection) => {
//   try {
//     const toDelete = Db._db.collection(collection);
//     await toDelete.deleteMany({});
//     console.log('Db.purge --- OK', collection);
//     return true;
//   } catch (err) {
//     console.error('Db.purge ---', err);
//     return false;
//   };
// };





// module.exports = Db;
