import React, { memo } from 'react';
import './Toolbar.css';
import { useGlobalContext } from '../../hooks';
import { cl } from '../../libs';





export default memo(function Toolbar({
  hidden = true,
  pos = '',
  children,
} = {}) {


  const [context] = useGlobalContext();
  const { uiMode } = context;


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
