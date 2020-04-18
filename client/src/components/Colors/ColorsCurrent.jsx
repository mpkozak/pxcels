import React, { memo } from 'react';
import { cl } from '../../libs';





export default memo(function ColorsCurrent({
  color = '#000',
  togglePalette = null,
  mouse = false,
} = {}) {


  return (
    <div
      className={cl(
        'Colors--current',
        'button',
        'button--big',
        [mouse, 'button--big__mouse'],
      )}
      style={{ backgroundColor: color }}
      onClick={togglePalette}
    />
  );
});
