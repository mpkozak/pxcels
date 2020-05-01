import { useEffect, useCallback } from 'react';
import {
  useGlobalContext,
  useTouchZoomOverride,
} from './';





export default function useInputDetect(splashRef = null) {
  const [context, dispatch] = useGlobalContext();
  const { uiMode } = context;


  void useTouchZoomOverride(uiMode === 1);


  const handleTouch = useCallback(e => {
    e.preventDefault();
    dispatch('uiMode', 1);
  }, [dispatch]);


  const handleMouse = useCallback(e => {
    e.preventDefault();
    dispatch('uiMode', 2);
  }, [dispatch]);


  useEffect(() => {
    const handleClick = e => e.preventDefault();
    const el = splashRef.current;
    if (el && !uiMode) {
      el.addEventListener('mousedown', handleMouse);
      el.addEventListener('touchstart', handleTouch);
      el.addEventListener('click', handleClick)
    };
    return () => {
      if (el) {
        el.removeEventListener('mousedown', handleMouse);
        el.removeEventListener('touchstart', handleTouch);
        el.removeEventListener('click', handleClick);
      };
    }
  }, [splashRef, uiMode, handleTouch, handleMouse]);
};
