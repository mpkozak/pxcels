import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  useRef,
  // useMemo,
  useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
// import { cl, parse } from '../../libs';








function usePanner({
  uiMode = 0,
  active = false,
  cb = null,
  // cb = null,
} = {}) {

  const [panning, setPanning] = useState(false);
  const pannerRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setPanning(false);
    };
  }, [active, setPanning]);










  useEffect(() => {
    const panner = pannerRef.current;
    if (panner) {

    }

  }, [uiMode, pannerRef])





  return pannerRef;
};







export default memo(function MapOverlay({
  uiMode = 0,
  active = false,
  pan = null,
  children,
} = {}) {


  const pannerRef
    = usePanner({
        uiMode,
        active,
        cb: pan,
      });



  const [panning, setPanning] = useState(false);





  const disablePanning = useCallback(e => {
    setPanning(false);
  }, [setPanning]);


  useEffect(() => {
    if (!active) {
      setPanning(false);
    };
  }, [active, setPanning]);


  const handleMouseMove = useCallback(e => {
    const { clientX, clientY } = e;
    pan(clientX, clientY);
  }, [pan]);


  const handleTouchMove = useCallback(e => {
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    pan(clientX, clientY);
  }, [pan]);


  const handleMouseDown = useCallback(e => {
    setPanning(true);
    const { clientX, clientY } = e;
    pan(clientX, clientY);
  }, [setPanning, pan]);


  const handleTouchStart = useCallback(e => {
    setPanning(true);
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    pan(clientX, clientY);
  }, [setPanning, pan]);


  useEffect(() => {
    if (panning) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', disablePanning);
      window.addEventListener('touchcancel', disablePanning);
      window.addEventListener('touchend', disablePanning);
    };
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', disablePanning);
      window.removeEventListener('touchcancel', disablePanning);
      window.removeEventListener('touchend', disablePanning);
    };
  }, [panning, handleMouseMove, disablePanning]);


  return (
    <div
      className="Map__overlay"
      ref={pannerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
});
