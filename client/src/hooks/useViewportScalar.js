import { useEffect, useCallback } from 'react';
import { useGlobalContext } from './';





export default function useViewportScalar() {
  const [context, dispatch] = useGlobalContext();
  const {
    width,
    height,
    scalar,
  } = context;


  const calcScale = useCallback(() => {
    // console.log('useViewportScalar -- calcScale')
    if (!width || !height) return null;
    const scalar = window.devicePixelRatio * 4;
    const viewportMinGridScale = .5;
    const viewportMaxCelPx = 100;
    const minCelX = (window.innerWidth * viewportMinGridScale) / width;
    const minCelY = (window.innerHeight * viewportMinGridScale) / height;
    const minCelPx = Math.min(minCelX, minCelY);
    const scaleRange = [minCelPx, viewportMaxCelPx].map(d => d / scalar);
    const scaleInitial = scaleRange.reduce((acc, d) => acc + d, 0) / 3;
    return { scalar, scaleRange, scaleInitial };
  }, [width, height]);


  const setScale = useCallback(() => {
    // console.log('useViewportScalar -- setScale')
    const scale = calcScale();
    if (!scale) return null;
    dispatch('scale', scale);
  }, [calcScale, dispatch]);


  useEffect(() => {
    window.addEventListener('resize', setScale, { passive: true });
    window.addEventListener('orientationchange', setScale);

    return () => {
      window.removeEventListener('resize', setScale);
      window.removeEventListener('orientationchange', setScale);
    };
  }, [setScale]);


  useEffect(() => {
    // console.log('useViewportScalar -- EFFECT')
    if (width && !scalar) {
      // console.log('useViewportScalar -- EFFECT RAN')
      setScale();
    };
  }, [width, scalar, setScale]);
};







// import {
//   useEffect,
//   useCallback,
// } from 'react';





// export default function useViewportScalar({
//   width,
//   height,
//   scalar,
//   dispatch,
// } = {}) {
//   // console.log('useViewportScalar ran')


//   const setScale = useCallback(() => {
//     console.log('useViewportScalar -- setScale')
//     if (!width || !height) return null;
//     const viewportMinGridScale = .5;
//     const viewportMaxCelPx = 100;
//     const minCelX = (window.innerWidth * viewportMinGridScale) / width;
//     const minCelY = (window.innerHeight * viewportMinGridScale) / height;
//     const minCelPx = Math.min(minCelX, minCelY);
//     const scaleRange = [minCelPx, viewportMaxCelPx].map(d => d / scalar);
//     const scaleInitial = scaleRange.reduce((acc, d) => acc + d, 0) / 3;
//     dispatch('scale', { scaleRange, scaleInitial });
//   }, [width, height, scalar, dispatch]);


//   useEffect(() => {
//     window.addEventListener('resize', setScale, { passive: true });
//     window.addEventListener('orientationchange', setScale);

//     return () => {
//       window.removeEventListener('resize', setScale);
//       window.removeEventListener('orientationchange', setScale);
//     };
//   }, [setScale]);


//   useEffect(() => {
//     console.log('useViewportScalar -- EFFECT')
//     setScale();
//   }, [setScale]);


//   return true;
// };
