


function parseTime(ms) {
  const formatOutput = (val, unit) => {
    const floor = Math.floor(val);
    return `${floor} ${unit}${(floor > 1) ? 's' : ''} ago`;
  };

  const seconds = ms * 1e-3
  if (seconds < 60) {
    return formatOutput(seconds, 'second');
  };
  const minutes = seconds / 60;
  if (minutes < 60) {
    return formatOutput(minutes, 'minute');
  };
  const hours = minutes / 60;
  if (hours < 24) {
    return formatOutput(hours, 'hour');
  };
  const days = hours / 24;
  return formatOutput(days, 'day');
};



function parsePct(val) {
  return Math.floor(val * 100) + '%';
};



function clampToRange(val, [min, max]) {
  if (val < min) {
    return min;
  };
  if (val > max) {
    return max;
  };
  return val;
};



export default Object.freeze({
  time: parseTime,
  pct: parsePct,
  clamp: clampToRange,
});
