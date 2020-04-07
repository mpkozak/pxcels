const Db = require('./Db.js');





const Grid = {};


Grid.backupInterval = process.env.GRID_BACKUP_INTERVAL * 1e3;
Grid.backupFlag = false;

Grid.backup = async () => {
  try {
    if (!Grid.backupFlag) {
      return;
    };
    Grid.backupFlag = false;
    const { current, history, params } = Grid;
    await Db.update('grid', { current, history, params });
    // console.log('Grid.backup --- OK');
  } catch (err) {
    console.error('Grid.backup ---', err);
  } finally {
    Grid.backupTimeout = setTimeout(Grid.backup, Grid.backupInterval);
    return;
  };
};

Grid.backupTimeout = setTimeout(Grid.backup, Grid.backupInterval);


Grid.update = ({ id, color, t, uuid, name }) => {
  const celIndex = Grid.current.findIndex(a => a.id === id);
  const cel = Grid.current[celIndex];
  if (!cel) {
    return null;
  };
  cel.color = color;
  cel.lastChangeUuid = uuid;
  cel.lastChangeAuthor = name;
  cel.lastChangeTime = t;
  Grid.history.push(cel);
  Grid.backupFlag = true;
  return { cel, celIndex };
};


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





module.exports = Grid;
