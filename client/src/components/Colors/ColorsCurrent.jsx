import React, { memo } from 'react';





export default memo(function ColorsCurrent({
  color = '#000',
  togglePalette = null,
  hasMouse = false,
} = {}) {


  return (
    <div
      className={
        'Colors--current'
        + ' button'
        + ' button--big'
        + (hasMouse ? ' button--big__mouse' : '')
      }
      style={{ backgroundColor: color }}
      onClick={togglePalette}
    />
  );
});
