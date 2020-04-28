import React, { memo } from 'react';
import './Toolbar.css';
import { cl } from '../../libs';





export default memo(function Toolbox({ pos = '', children } = {}) {
  return (
    <div className={cl('Toolbox', `Toolbox--${pos}`)}>
      {children}
    </div>
  );
});
