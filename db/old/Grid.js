const fs = require('fs').promises;
const path = require('path');





/*
    Initialization
*/

const { current, history, params } = init();


function init() {
  try {
    return require('./db_grid.json');
  } catch (err) {
    return reset();
  };
};





/*
    Reset
*/

function protoGrid() {
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


function reset() {
  const grid = protoGrid();

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





/*
    Update
*/

function update({ id, color, t, uuid, name }) {
  const celIndex = current.findIndex(a => a.id === id);
  const cel = current[celIndex];
  if (!cel) {
    return null;
  };
  cel.color = color;
  cel.lastChangeUuid = uuid;
  cel.lastChangeAuthor = name;
  cel.lastChangeTime = t;
  history.push(cel);
  return { cel, celIndex };
};





/*
    Backup
*/

const backupInterval = process.env.GRID_BACKUP_INTERVAL * 1e3;
let backupTimeout = setTimeout(backup, backupInterval);

async function backup() {
  // console.log('grid backup ran')
  const dbFile = path.join(__dirname, 'db_grid.json');
  const data = JSON.stringify({ current, history, ...params }, null, 2);
  await fs.writeFile(dbFile, data, 'utf-8');
  backupTimeout = setTimeout(backup, backupInterval);
  return;
};





module.exports = {
  current,
  history,
  params,
  update,
};
