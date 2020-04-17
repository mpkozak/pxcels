import {
  // Fragment,
  // createContext,
  // memo,
  // useContext,
  // useRef,
  // useMemo,
  // useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import { useGlobalState } from './';
import { parse } from '../libs';





export default function useViewportScalar() {
  // console.log('useViewportScalar ran')

  const [state, setState] = useGlobalState();
  const {
    width,
    height,
    scalar,
    viewportMinGridScale,
    viewportMaxCelPx,
    scaleRange,
  } = state;


  const setScale = useCallback(() => {
    const minCelX = (window.innerWidth * viewportMinGridScale) / width;
    const minCelY = (window.innerHeight * viewportMinGridScale) / height;
    const minCelPx = Math.min(minCelX, minCelY);
    const min = minCelPx / scalar;
    const max = viewportMaxCelPx / scalar;
    setState('scaleRange', [min, max]);
  }, [width, height, scalar, viewportMinGridScale, viewportMaxCelPx, setState]);


  useEffect(() => {
    window.addEventListener('resize', setScale, { passive: true });
    window.addEventListener('orientationchange', setScale);

    return () => {
      window.removeEventListener('resize', setScale);
      window.removeEventListener('orientationchange', setScale);
    };
  }, [setScale]);


  const clampScale = useCallback(val => {
    return parse.clamp(val, scaleRange).toFixed(2);
  }, [scaleRange]);


  // useEffect(() => {
  //   if (!scaleRange.length) {
  //     setScale();
  //   };
  // }, [scaleRange, setScale]);


  useEffect(() => {
    if (width && height && !scaleRange.length) {
      setScale();
    };
  }, [width, height, scaleRange, setScale]);


  return {
    initialScale: scaleRange.reduce((acc, d) => acc + d, 0) / 2,
    clampScale,
  };
};
