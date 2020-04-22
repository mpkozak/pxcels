import React, {
  memo
} from 'react';
import './Splash.css';
import { cl } from '../../libs';





export default memo(function Splash({
  splashRef = null,
  gridReady = false,
} = {}) {


  return (
    <div
      className={cl('Splash', [!gridReady, 'Splash--loading'])}
      ref={splashRef}
    >
      <h1>PxCels by<br />Kozak</h1>
      <h2>Click to<br />continue.</h2>
    </div>
  );
});
