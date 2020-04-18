const { MongoClient } = require('mongodb');





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useUnifiedTopology: true });



const Db = {};



Db._collections = {
  current: {
    _c: undefined,
    get: function() {
      return this._c.find().toArray();
    },
    getOne: function(id) {
      return this._c.findOne({ _id: id });
    },
    update: function(arr) {
      const queue = arr.map(d => ({
        updateOne: {
          filter: { _id: d._id },
          update: { $set: { current: d.current } }
        }
      }));
      return this._c.bulkWrite(queue);
    },
    // insert: function(arr) {
    //   const queue = arr.map(d => {
    //     const entry = {
    //       _id: d._id
    //       cel_id: d.cel_id,
    //       col: d.col,
    //       row: d.row,
    //       current: {
    //         color: 26,
    //         user_uuid: '',
    //         user_name: '',
    //         timestamp: Date.now(),
    //       },
    //     };
    //     return { insertOne: { document: { ...entry } } };
    //   });
    //   return this._c.bulkWrite(queue);
    // },
  },
  history: {
    _c: undefined,
    get: function() {
      return this._c.find().toArray();
    },
    getOne: function(id) {
      return this._c.findOne({ _id: id });
    },
    insert: function(arr) {
      const queue = arr.map(d => {
        const entry = {
          cel_id: d.cel_id,
          timestamp: d.timestamp,
          color: d.color,
          user_uuid: d.user_uuid,
          user_name: d.user_name,
        };
        return { insertOne: { document: { ...entry } } };
      });
      return this._c.bulkWrite(queue);
    },
  },
  params: {
    _c: undefined,
    get: function() {
      return this._c.findOne({ _id: 'data' }, { projection: { _id: 0 } });
    },
    updateOne: function(_id, obj) {
      return this._c.updateOne(
        { _id: _id },
        { $set: { ...obj } }
      );
    },
  },
  users: {
    _c: undefined,
    get: function() {
      return this._c.find().toArray()
        .then(a => a
          .reduce((acc, { _id, ...data }) => ({ ...acc, [_id]: data }), {})
        );
    },
    getOne: function(id) {
      return this._c.findOne({ _id: id });
    },
    insertOne: function(obj) {
      return this._c.insertOne(obj);
    },
    updateOne: function(_id, obj) {
      return this._c.updateOne(
        { _id: _id },
        { $set: { ...obj } }
      );
    },
  },
};



Db.Mount = () => {    // add all remote collections to _collections object
  try {
    Object.keys(Db._collections).forEach(key => {
      Db._collections[key]._c = Db._db.collection(key);
    });
    return true;
  } catch (err) {
    console.error('Db.Mount ---', err);
    return false;
  };
};


Db.Connect = async () => {
  console.log('Connect Db...');
  try {
    const db = await new Promise((res, rej) => {
      client.connect(async (err, client) => {
        if (err) {
          rej(err);
        };
        const db = client.db('grid');
        res(db);
      });
    });
    Db._db = db;
    Db.Mount();
    return true;
  } catch (err) {
    console.error('Connect Db ---', err);
    throw err;
  };
};


Db.Close = async () => {
  console.log('Close Db...');
  try {
    await client.close();
    return true;
  } catch (err) {
    console.error('Close Db ---', err);
    throw err;
  };
};





Db.get = (coll) => Db._collections[coll].get();
Db.getOne = (coll, id) => Db._collections[coll].getOne(id);
Db.update = (coll, arr) => Db._collections[coll].update(arr);
Db.updateOne = (coll, id, obj) => Db._collections[coll].updateOne(id, obj);
Db.insert = (coll, arr) => Db._collections[coll].insert(arr);
Db.insertOne = (coll, obj) => Db._collections[coll].insertOne(obj);





module.exports = Db;
