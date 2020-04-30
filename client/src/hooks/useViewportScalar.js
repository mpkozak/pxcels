import {
  // useMemo,
  // useState,
  useEffect,
  useCallback,
} from 'react';





const viewportParams = Object.freeze({
  viewportMinGridScale: .5,
  viewportMaxCelPx: 100,
});





export default function useViewportScalar({
  width,
  height,
  scalar,
  dispatch,
} = {}) {

    console.log('useViewportScalar ran')

  const {
    viewportMinGridScale,
    viewportMaxCelPx,
  } = viewportParams;


  const setScale = useCallback(() => {
    if (!width || !height) return null;
    console.log('setScale ran')
    const minCelX = (window.innerWidth * viewportMinGridScale) / width;
    const minCelY = (window.innerHeight * viewportMinGridScale) / height;
    const minCelPx = Math.min(minCelX, minCelY);
    const scaleRange = [minCelPx, viewportMaxCelPx].map(d => d / scalar);
    const scaleInitial = scaleRange.reduce((acc, d) => acc + d, 0) / 3;
    dispatch('scale', { scaleRange, scaleInitial });
  }, [width, height, scalar, viewportMinGridScale, viewportMaxCelPx, dispatch]);


  useEffect(() => {
    window.addEventListener('resize', setScale, { passive: true });
    window.addEventListener('orientationchange', setScale);

    return () => {
      window.removeEventListener('resize', setScale);
      window.removeEventListener('orientationchange', setScale);
    };
  }, [setScale]);


  useEffect(() => {
    console.log('useViewportScalar EFFECT')
    // if (width && height && !scaleRange) {
      setScale();
  }, [setScale]);


  return true;
};
