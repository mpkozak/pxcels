import React, { memo } from 'react';
import { cl } from '../../libs';





export default memo(function SplashLoad({ gridReady = false } = {}) {
  return (
    <div className={cl('Splash-load', [gridReady, 'Splash-load--hide'])}>
      <div className="Splash-load__wrap">
        <div className="Splash-load__cel Splash-load__cel--red" />
        <div className="Splash-load__cel Splash-load__cel--green" />
        <div className="Splash-load__cel Splash-load__cel--blue" />
      </div>
    </div>
  );
});
