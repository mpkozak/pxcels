import {
  // Fragment,
  // createContext,
  // memo,
  // useContext,
  useRef,
  // useMemo,
  useState,
  // useReducer,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import { parse } from '../libs';





export default function useZoom({
  scaleRange = [],
  scaleInitial = 1,
  uiMode = 0,
  gridRef = null,
  windowRef = null,
} = {}) {


  const [zoom, setZoom] = useState(null);
  const [center, setCenter] = useState(null);


  const storeCenter = useCallback((reset = false) => {
    if (reset) {
      return setCenter(null);
    };
    const {
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
      scrollLeft,
      scrollTop
    } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);


  const calcZoom = useCallback(val => {
    return parse.clamp(val, scaleRange).toFixed(2);
  }, [scaleRange])


  const updateZoom = useCallback(zoomIn => {
    const newZoom = calcZoom(zoom * (zoomIn ? 1.4 : 0.6));
    if (newZoom) {
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoom, calcZoom, storeCenter]);



  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (!el) return null;
    const {
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
      scrollLeft,
      scrollTop,
    } = el;
    el.scrollTo(scrollLeft, scrollTop);
    const targetX = scrollWidth * x - (clientWidth / 2);
    const targetY = scrollHeight * y - (clientHeight / 2);
    const deltaX = parse.clamp(targetX, [0, scrollWidth]) - scrollLeft;
    const deltaY = parse.clamp(targetY, [0, scrollHeight]) - scrollTop;
    el.scrollBy(deltaX, deltaY);
  }, [windowRef]);



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
    e.preventDefault();
    const { scale, targetTouches } = e;
    if (!scale || targetTouches.length !== 2) {
      return setZoomActive(false);
    };
    if (!zoomActive) {
      return null;
    };
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


















  useEffect(() => {   // set initial zoom and scroll to random spot
    if (scaleInitial && !zoom) {
      const paddedRandom = () => (Math.random() + 1) * .5;
      setZoom(scaleInitial);
      panWindow(paddedRandom(), paddedRandom());
    };
  }, [scaleInitial, zoom, setZoom, panWindow]);


  useLayoutEffect(() => {   // recenter window
    if (center) {
      panWindow(...center);
    };
  }, [center, panWindow]);


  return {
    zoom,
    updateZoom,
    panWindow,
    zoomListeners: (uiMode === 1)
      ? { onTouchStart: handleTouchStart }
      : {},
  };
};





// import React, {
//   Fragment,
//   createContext,
//   memo,
//   useContext,
//   useRef,
//   useMemo,
//   useState,
//   useReducer,
//   useEffect,
//   useLayoutEffect,
//   useCallback,
// } from 'react';
// import { parse } from '../libs';





// export default function useZoom({
//   gridRef = null,
//   windowRef = null,
//   scaleInitial = 1,
//   scaleRange = [],
// } = {}) {

//   const [zoom, setZoom] = useState(null);
//   const [center, setCenter] = useState(null);


//   const panWindow = useCallback((x, y) => {
//     const el = windowRef.current;
//     if (el) {
//       const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
//       el.scrollTo(scrollLeft, scrollTop);
//       const targetX = scrollWidth * x - (clientWidth / 2);
//       const targetY = scrollHeight * y - (clientHeight / 2);
//       const deltaX = parse.clamp(targetX, [0, scrollWidth]) - scrollLeft;
//       const deltaY = parse.clamp(targetY, [0, scrollHeight]) - scrollTop;
//       el.scrollBy(deltaX, deltaY);
//     };
//   }, [windowRef]);


//   const storeCenter = useCallback((reset = false) => {
//     if (reset) {
//       return setCenter(null);
//     };
//     const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
//     const x = (scrollLeft + clientWidth / 2) / scrollWidth;
//     const y = (scrollTop + clientHeight / 2) / scrollHeight;
//     setCenter([x, y]);
//   }, [windowRef, setCenter]);


//   const calcZoom = useCallback((val) => {
//     return parse.clamp(val, scaleRange).toFixed(2);
//   }, [scaleRange])


//   const updateZoom = useCallback((zoomIn) => {
//     const newZoom = calcZoom(zoom * (zoomIn ? 1.4 : 0.6));
//     if (newZoom) {
//       storeCenter();
//       setZoom(newZoom);
//     };
//   }, [zoom, calcZoom, storeCenter]);


//   useEffect(() => {   // set initial zoom and scroll to random spot
//     if (scaleInitial && !zoom) {
//       const paddedRandom = () => (Math.random() + 1) * .5;
//       setZoom(scaleInitial);
//       panWindow(paddedRandom(), paddedRandom());
//     };
//   }, [scaleInitial, zoom, setZoom, panWindow]);


//   useLayoutEffect(() => {   // recenter window
//     if (center) {
//       panWindow(...center);
//     };
//   }, [center, panWindow]);


//   return {
//     zoom,
//     setZoom,
//     calcZoom,
//     updateZoom,
//     storeCenter,
//     panWindow,
//   };
// };
