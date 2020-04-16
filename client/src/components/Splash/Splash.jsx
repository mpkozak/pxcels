import React, { memo } from 'react';
import './Splash.css'





export default memo(function Splash({
  splashRef = null,
  gridStatus = 0,
} = {}) {


  return (
    <div
      className={
        'Splash'
        + (!gridStatus ? ' loading' : '')
      }
      ref={splashRef}
    >
      <h1>PxCels by<br />Kozak</h1>
      <h2>Click to<br />continue.</h2>
    </div>
  );
});
