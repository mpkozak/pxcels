import React, {
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';





export default memo(function MapOverlay({
  uiMode = 0,
  active = false,
  pan = null,
  children,
} = {}) {


  const [panning, setPanning] = useState(false);


  const disablePanning = useCallback(e => {
    setPanning(false);
  }, [setPanning]);


  const handleTouchMove = useCallback(e => {
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    pan(clientX, clientY);
  }, [pan]);


  const handleTouchStart = useCallback(e => {
    setPanning('touch');
    handleTouchMove(e);
  }, [setPanning, handleTouchMove]);


  const handleMouseMove = useCallback(e => {
    const { clientX, clientY } = e;
    pan(clientX, clientY);
  }, [pan]);


  const handleMouseDown = useCallback(e => {
    setPanning('mouse');
    handleMouseMove(e);
  }, [setPanning, handleMouseMove]);


  useEffect(() => {   // disable panning when map is small
    if (!active) {
      setPanning(false);
    };
  }, [active, setPanning]);


  useEffect(() => {   // add+remove listeners based on panning state
    if (panning === 'mouse') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', disablePanning);
    };
    if (panning === 'touch') {
      window.addEventListener('touchend', disablePanning);
      window.addEventListener('touchcancel', disablePanning);
    };
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', disablePanning);
      window.removeEventListener('touchend', disablePanning);
      window.removeEventListener('touchcancel', disablePanning);
    };
  }, [panning, uiMode, handleMouseMove, disablePanning]);


  const listeners = useMemo(() => {
    if (uiMode === 2) {
      return {
        onMouseDown: handleMouseDown,
      };
    };
    if (uiMode === 1) {
      return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
      };
    };
    return {};
  }, [uiMode, handleMouseDown, handleTouchStart, handleTouchMove]);


  return (
    <div
      className="Map__overlay"
      {...listeners}
    >
      {children}
    </div>
  );
});
