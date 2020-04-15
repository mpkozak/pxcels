import React, { memo } from 'react';





export default memo(function ColorsCurrent({ color = '#000', click = null } = {}) {
  return (
    <div
      className="Colors--current"
      // className="button button--big button--big__mouse"
      style={{ backgroundColor: color }}
      onClick={click}
    />
  );
});
