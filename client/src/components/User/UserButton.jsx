import React, { memo, useMemo } from 'react';
import { cl } from '../../libs';





export default memo(function UserButton({
  uiMode = 0,
  toggleForm = null,
} = {}) {


  const buttonCl = useMemo(() => cl(
    'User__button btn btn--lg',
    [uiMode === 2, 'User__button--mouse'],
  ), [uiMode]);


  return (
    <div className={buttonCl} onClick={toggleForm} />
  );
});
