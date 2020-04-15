import { useMemo, useCallback } from 'react';





export default function useViewportScalar({ width, height, scalar } = {}) {
  const minScale = useMemo(() => {
    const minViewportDimen = .5;
    const minCelX = (window.innerWidth * minViewportDimen) / width;
    const minCelY = (window.innerHeight * minViewportDimen) / height;
    const minCelPx = Math.min(minCelX, minCelY);
    return minCelPx / scalar;
  }, [width, height, scalar]);

  const maxScale = useMemo(() => {
    const maxCelPx = 100;
    return maxCelPx / scalar;
  }, [scalar]);

  const clampScale = useCallback((val) => {
    let out = val
    if (val < minScale) {
      out = minScale;
    };
    if (val > maxScale) {
      out = maxScale;
    };
    return out.toFixed(2);
  }, [minScale, maxScale]);


  return {
    initialScale: (minScale + maxScale) / 2,
    clampScale,
  };
};
