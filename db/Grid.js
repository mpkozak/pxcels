const fs = require('fs').promises;
const path = require('path');





/*
    Initialization
*/

const { current, history } = init();


function init() {
  try {
    var grid = require('./db_grid.json');
  } catch (err) {
    console.error('No Grid backup available!');
    grid = reset();
  } finally {
    return grid;
  };
};


function reset() {
  const width = process.env.GRID_WIDTH || 128;
  const height = process.env.GRID_HEIGHT || 72;
  const grid = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      grid.push({
        id: `c${col}r${row}`,
        col,
        row,
        color: 'white',
        lastChangeAuthor: '',
        lastChangeTime: Date.now(),
      });
    };
  };

  return {
    current: grid,
    history: [],
  };
};





/*
    Update
*/

function update({ id, color, t, uuid }) {
// verify users last update
  const cel = current.find(a => a.id === id);
  cel.color = color;
  cel.lastChangeAuthor = uuid;
  cel.lastChangeTime = t;
  return cel;
};





/*
    Backup
*/

const backupInterval = process.env.GRID_BACKUP_INTERVAL * 1e3;

let backupTimeout = setTimeout(backup, backupInterval);

async function backup() {
  console.log('backupRan')
  const dbFile = path.join(__dirname, 'db_grid.json');
  const data = JSON.stringify({ current, history }, null, 2);
  await fs.writeFile(dbFile, data, 'utf-8');
  backupTimeout = setTimeout(backup, backupInterval);
  return;
};





module.exports = {
  current,
  update,
};
