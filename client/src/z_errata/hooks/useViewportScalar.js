import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';





const viewportParams = Object.freeze({
  scalar: (window.devicePixelRatio * 4),
  viewportMinGridScale: .5,
  viewportMaxCelPx: 100,
});





export default function useViewportScalar({
  width,
  height,
} = {}) {

  const {
    scalar,
    viewportMinGridScale,
    viewportMaxCelPx,
  } = viewportParams;


  const [scaleRange, setScaleRange] = useState(null);


  const setScale = useCallback(() => {
    const minCelX = (window.innerWidth * viewportMinGridScale) / width;
    const minCelY = (window.innerHeight * viewportMinGridScale) / height;
    const minCelPx = Math.min(minCelX, minCelY);
    const min = minCelPx / scalar;
    const max = viewportMaxCelPx / scalar;
    setScaleRange([min, max]);
  }, [width, height, scalar, viewportMinGridScale, viewportMaxCelPx, setScaleRange]);


  // useEffect(() => {
  //   window.addEventListener('resize', setScale, { passive: true });
  //   window.addEventListener('orientationchange', setScale);

  //   return () => {
  //     window.removeEventListener('resize', setScale);
  //     window.removeEventListener('orientationchange', setScale);
  //   };
  // }, [setScale]);


  useEffect(() => {
    if (width && height && !scaleRange) {
      setScale();
    };
  }, [width, height, scaleRange, setScale]);


  const scaleInitial = useMemo(() => {
    if (!scaleRange) return null;
    return scaleRange.reduce((acc, d) => acc + d, 0) / 2;
  }, [scaleRange]);


  return {
    scalar,
    scaleRange,
    scaleInitial,
  };
};
