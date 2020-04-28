import React, { memo } from 'react';
import './Toolbar.css';
import { cl } from '../../libs';





export default memo(function Toolbar({
  uiMode = 0,
  hidden = true,
  pos = '',
  children,
} = {}) {


  return (
    <div
      className={cl(
        'Toolbar',
        `Toolbar--${pos}`,
        [hidden, 'Toolbar--hide'],
        [uiMode === 1, 'Toolbar--touch']
      )}
    >
      {children}
    </div>
  );
});
