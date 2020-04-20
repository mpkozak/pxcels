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





export default memo(function GridZoom({
  uiMode = 0,
  gridRef = null,
  gridStyle = {},
  zoom = 1,
  setZoom = null,
  calcZoom = null,
  storeCenter = null,
  children,
} = {}) {


  const [zoomActive, setZoomActive] = useState(null);
  const [scale, setScale] = useState(1);
  const prevZoom = useRef(null);


  const handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    if (targetTouches.length !== 2) {
      return setZoomActive(false);
    };
    e.preventDefault();
    prevZoom.current = zoom;
    storeCenter();
    setZoomActive(true);
  }, [setZoomActive, prevZoom, zoom, storeCenter]);


  const handleTouchMove = useCallback(e => {
    const { scale, targetTouches } = e;
    if (!scale || targetTouches.length !== 2) {
      // e.stopPropagation();
      return setZoomActive(false);
    };
    if (!zoomActive) {
      return null;
    };
    e.preventDefault();
    storeCenter();
    setScale(scale);
  }, [setZoomActive, zoomActive, storeCenter, setScale]);


  const handleTouchEnd = useCallback(e => {
    storeCenter(true);
    setZoomActive(false);
  }, [storeCenter, setZoomActive]);


  useEffect(() => {
    const el = gridRef.current;
    if (el && zoomActive) {
      el.addEventListener('touchmove', handleTouchMove, { passive: true });
      el.addEventListener('touchend', handleTouchEnd, { passive: true });
      el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    };
    return () => {
      if (el) {
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        el.removeEventListener('touchcancel', handleTouchEnd);
      };
    };
  }, [gridRef, zoomActive, handleTouchMove, handleTouchEnd]);


  useEffect(() => {
    if (!zoomActive) {
      prevZoom.current = zoom;
      storeCenter(true);
      setScale(1);
    };
    if (zoomActive) {
      const newZoom = calcZoom(prevZoom.current * scale);
      if (newZoom) {
        storeCenter();
        setZoom(newZoom);
      };
    };
  }, [zoomActive, prevZoom, storeCenter, scale, setScale, calcZoom, zoom, setZoom]);


  return (
      <div
        className="Grid__zoom"
        ref={gridRef}
        style={gridStyle}
        {...(uiMode === 1 && { onTouchStart: handleTouchStart })}
      >
        {children}
      </div>
  );
});
