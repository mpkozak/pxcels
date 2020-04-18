import React, { memo } from 'react';
import './Splash.css'
import { parse } from '../../libs';
const { cl } = parse;





export default memo(function Splash({
  splashRef = null,
  loading = true,
} = {}) {


  return (
    <div className={cl('Splash', { loading })} ref={splashRef}>
      <h1>PxCels by<br />Kozak</h1>
      <h2>Click to<br />continue.</h2>
    </div>
  );
});
