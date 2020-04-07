const { MongoClient } = require('mongodb');





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-eujzt.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useUnifiedTopology: true });





const Db = {};


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


Db.get = async (collection) => {
  try {
    const src = Db._db.collection(collection);
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


Db.update = async (collection, data) => {
  try {
    const toUpdate = Db._db.collection(collection);
    Object.entries(data).forEach(async ([key, data]) => {
      await toUpdate.replaceOne({ _id: key }, { data });
    });
    return true;
  } catch (err) {
    console.error('Db.update ---', err);
    return false;
  };
};


Db.seed = async (collection, data) => {
  try {
    const toSeed = Db._db.collection(collection);
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
    const toDelete = Db._db.collection(collection);
    await toDelete.deleteMany({});
    console.log('Db.purge --- OK', collection);
    return true;
  } catch (err) {
    console.error('Db.purge ---', err);
    return false;
  };
};





module.exports = Db;
