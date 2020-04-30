import { useEffect } from 'react';





export default function useTouchZoomOverride(enableOverride = true) {
  useEffect(() => {
    const cancelTouch = e => {
      if (e.touches.length === 2) {
        e.preventDefault();
      };
    };
    if (enableOverride) {
      window.addEventListener('touchmove', cancelTouch, { passive: false });
    };
    return () => window.removeEventListener('touchmove', cancelTouch);
  }, [enableOverride]);
};
