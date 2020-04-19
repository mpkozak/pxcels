import React, { memo } from 'react';
import { cl } from '../../libs';





export default memo(function ColorsButton({
  uiMode = 0,
  color = '#000',
  togglePalette = null,
} = {}) {


  return (
    <div
      className={cl(
        'Colors__button btn btn--lg',
        [uiMode === 2, 'Colors__button--mouse'],
      )}
      style={{ backgroundColor: color }}
      onClick={togglePalette}
    />
  );
});
