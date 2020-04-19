import React, {
  memo,
  useMemo,
} from 'react';
import { cl } from '../../libs';





export default memo(function ColorsButton({
  uiMode = 0,
  color = '#000',
  togglePalette = null,
} = {}) {


  const buttonCl = useMemo(() => cl(
    'Colors__button btn btn--lg',
    [uiMode === 2, 'Colors__button--mouse'],
  ), [uiMode]);


  return (
    <div
      className={buttonCl}
      style={{ backgroundColor: color }}
      onClick={togglePalette}
    />
  );
});
