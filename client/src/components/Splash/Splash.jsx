import React, { memo, useRef, useEffect, useCallback } from 'react';
import './Splash.css';
import { useInputDetect } from '../../hooks';
import { cl } from '../../libs';
import { SplashLoad } from './';





export default memo(function Splash({
  gridReady = false,
  hideSplash = null,
} = {}) {

  const splashRef = useRef(null);
  void useInputDetect(splashRef);


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
      <SplashLoad gridReady={gridReady} />
      <h2>Click to<br />continue.</h2>
    </div>
  );
});
