import React, { memo, useRef, useEffect, useCallback } from 'react';
import './Splash.css';
import { cl } from '../../libs';





export default memo(function Splash({
  splashRef = null,
  gridReady = false,
  hideSplash = null,
} = {}) {


  const readyRef = useRef(0);


  useEffect(() => {
    if (gridReady && !readyRef.current) {
      readyRef.current = Date.now();
    };
  }, [gridReady, readyRef]);


  const handleClick = useCallback(e => {
    const ts = readyRef.current;
    if (!ts || (Date.now() - ts) < 500) {
      return null;
    };
    e.stopPropagation();
    return hideSplash();
  }, [readyRef, hideSplash]);


  return (
    <div
      className={cl('Splash', [!gridReady, 'Splash--loading'])}
      ref={splashRef}
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      <h1>PxCels by<br />Kozak</h1>
      <h2>Click to<br />continue.</h2>
    </div>
  );
});
