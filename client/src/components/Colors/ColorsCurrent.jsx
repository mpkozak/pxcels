import React, { memo } from 'react';





export default memo(function ColorsCurrent({ color = '#000', click = null } = {}) {
  return (
    <div
      className="Colors--current"
      style={{ backgroundColor: color }}
      onClick={click}
    />
  );
});
