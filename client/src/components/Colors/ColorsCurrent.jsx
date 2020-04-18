import React, { memo } from 'react';
import { parse } from '../../libs';
const { cl } = parse;




export default memo(function ColorsCurrent({
  color = '#000',
  togglePalette = null,
  hasMouse = false,
} = {}) {


  return (
    <div
      className={cl(
        'Colors--current',
        'button',
        'button--big',
        [hasMouse, 'button--big__mouse'],
      )}
      style={{ backgroundColor: color }}
      onClick={togglePalette}
    />
  );
});
