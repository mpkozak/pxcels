const path = require('path');
const fs = require('fs').promises;





// DB

const {
  Db,
  Grid,
  User,
  GlobalState,
} = require('./');





async function updateDimensions(w, h) {
  const dbFile = path.join(__dirname, '_local', 'db_grid.json');
  const dbGrid = require(dbFile);
  const { params } = dbGrid;
  const { colors } = params;
  const newParams = {
    width: w,
    height: h,
    colors: colors,
  };

  await Db.Connect();
  const coll = Db._db.collection('params');

  coll.updateOne(
    { _id: 'data' },
    { $set: { ...newParams } }
  );
};


// updateDimensions(256, 256);





async function saveLocal() {      // saves grid data and users to local
  try {
    await Db.Connect();
    await GlobalState.Init();

    console.log('writing grid to file...')
    const { current, params } = Grid;
    const gridData = { current, params };
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
}

// saveLocal()





const getSortInt = (str) => {
  const noC = str.substr(1);
  const [c, r] = noC.split('r').map(d => parseInt(d, 10));
  const sum = r * 1e3 + c;
  return sum;
};

const sortGrid = (grid) => grid.sort((a, b) => getSortInt(a.cel_id) - getSortInt(b.cel_id))

async function expandGrid(rows, cols) {     // reads local grid json and expands and reindexes with more cels,
  try {
    console.log('do this')
    const gridFile = path.join(__dirname, '_local', 'db_grid.json');
    const { current } = require(gridFile);
    const gridSorted = sortGrid(current);
    const lastCel = gridSorted[gridSorted.length - 1];
    const startRow = lastCel.row + 1;
    const startCol = lastCel.col + 1;
    const endRow = startRow + rows;
    const endCol = startCol + cols;
    console.log('startRow', startRow, startCol, endRow, endCol)

    const newGrid = [...gridSorted];

    for (let r = 0; r < endRow; r++) {
      let c = r >= startRow ? 0 : startCol;
      for (c; c < endCol; c++) {
        // console.log("in loop", r, c)
        newGrid.push({
          cel_id: `c${c}r${r}`,
          col: c,
          row: r,
          current: {
            color: 26,
            user_uuid: '',
            user_name: '',
            timestamp: Date.now(),
          },
        });
      };
    };

    const newGridSorted = sortGrid(newGrid);
    const newGridWithID = newGridSorted.map((d, i) => {
      const { cel_id, col, row, current } = d;
      return {
        _id: i,
        cel_id,
        col,
        row,
        current,
      };
    });

    console.log(newGrid.length, newGrid.length / endCol)

    const newGridJson = JSON.stringify(newGridWithID, null, 2);
    const newGridFile = path.join(__dirname, '_local', 'db_grid_mig.json');
    await fs.writeFile(newGridFile, newGridJson, 'utf-8');

    console.log("file successfully written");

  } catch (err) {
    console.error(err)
  } finally {
    console.log('all done')
    return true;
  };
};

// expandGrid(64, 64);





async function replaceGrid() {    // reads local migration json file and overwrites db
  try {
    await Db.Connect();
    const coll = Db._db.collection('current');
    await coll.deleteMany({});
    console.log('deleted')
    const gridFile = path.join(__dirname, '_local', 'db_grid_mig.json');
    const newSeed = require(gridFile);

    const current = newSeed.map(d => {
      return { insertOne: { document: { ...d } } };
    });
    console.log('new', current);

    const done = await coll.bulkWrite(current);
    console.log(done)
    console.log("done writing cels")
    const { col, row } = newSeed[newSeed.length - 1]
    console.log('updating params', col, row);
    await updateDimensions(col, row);
    console.log("params successfully updated")
  } catch (err) {
    console.error(err)
  } finally {
    console.log('all done')
    return true;
  };
};

// replaceGrid()











