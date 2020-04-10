const Db = require('./Db.js');





const Grid = {};


Grid.backupInterval = process.env.GRID_BACKUP_INTERVAL * 1e3;
Grid.backupQueue = [];

Grid.backup = async () => {
  try {
    if (!Grid.backupQueue.length) {
      return;
    };
    const queue = Grid.backupQueue.splice(0, Grid.backupQueue.length);
    const stageCurrent = [];
    const stageHistory = [];
    queue.forEach(d => {
      const { _id, cel_id, ...current } = d;
      stageCurrent.push({ _id, current });
      stageHistory.push({ cel_id, ...current });
    });
    await Db.update('current', stageCurrent);
    await Db.insert('history', stageHistory);
  } catch (err) {
    console.error('Grid.backup ---', err);
  } finally {
    Grid.backupTimeout = setTimeout(Grid.backup, Grid.backupInterval);
    return;
  };
};

Grid.backupTimeout = setTimeout(Grid.backup, Grid.backupInterval);





Grid.update = ({ cel_id, color, t, uuid, name }) => {
  const celIndex = Grid.current.findIndex(a => a.cel_id === cel_id);
  const cel = Grid.current[celIndex];
  if (!cel) {
    return null;
  };
  const { _id } = cel;

  cel.current = {
    color: color,
    user_uuid: uuid,
    user_name: name,
    timestamp: t,
  };

  Grid.backupQueue.push({ _id, cel_id, ...cel.current });
  return { _id, current: cel.current };
};





module.exports = Grid;
