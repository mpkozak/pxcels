import React, {
  Fragment,
  createContext,
  memo,
  useContext,
  useRef,
  useMemo,
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import { parse } from '../libs';





export default function useZoom({
  gridRef = null,
  windowRef = null,
  scaleInitial = 1,
  scaleRange = [],
} = {}) {

  const [zoom, setZoom] = useState(null);
  const [center, setCenter] = useState(null);


  const panWindow = useCallback((x, y) => {
    const el = windowRef.current;
    if (el) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = el;
      el.scrollTo(scrollLeft, scrollTop);
      const targetX = scrollWidth * x - (clientWidth / 2);
      const targetY = scrollHeight * y - (clientHeight / 2);
      const deltaX = parse.clamp(targetX, [0, scrollWidth]) - scrollLeft;
      const deltaY = parse.clamp(targetY, [0, scrollHeight]) - scrollTop;
      el.scrollBy(deltaX, deltaY);
    };
  }, [windowRef]);


  const storeCenter = useCallback((reset = false) => {
    if (reset) {
      return setCenter(null);
    };
    const { scrollWidth, scrollHeight, clientWidth, clientHeight, scrollLeft, scrollTop } = windowRef.current;
    const x = (scrollLeft + clientWidth / 2) / scrollWidth;
    const y = (scrollTop + clientHeight / 2) / scrollHeight;
    setCenter([x, y]);
  }, [windowRef, setCenter]);


  const calcZoom = useCallback((val) => {
    return parse.clamp(val, scaleRange).toFixed(2);
  }, [scaleRange])


  const updateZoom = useCallback((zoomIn) => {
    const newZoom = calcZoom(zoom * (zoomIn ? 1.4 : 0.6));
    if (newZoom) {
      storeCenter();
      setZoom(newZoom);
    };
  }, [zoom, calcZoom, storeCenter]);


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
    setZoom,
    calcZoom,
    updateZoom,
    storeCenter,
    panWindow,
  };
};
