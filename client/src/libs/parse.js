


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



function concatClassName(...args) {
  return args.reduce((acc, d) => {
    switch (typeof d) {
      case 'string':
        acc += `${d} `;
        break;
      case 'object':
        if (Array.isArray(d)) {
          const [test, trueStr = '', falseStr = ''] = d;
          acc += `${!!test ? trueStr : falseStr} `;
          break;
        };
        acc += Object.entries(d).reduce((acc, d)=> {
          const [str, test] = d;
          acc += `${!!test ? str : ''} `;
          return acc;
        }, '');
        break;
      default:
        return acc;
    };
    return acc;
  }, '').trim();
};





export const parse = Object.freeze({
  time: parseTime,
  pct: parsePct,
  clamp: clampToRange,
});

export default concatClassName;
