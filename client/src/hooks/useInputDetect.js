import {
  // Fragment,
  // createContext,
  // memo,
  // useContext,
  useRef,
  useMemo,
  // useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import { useGlobalState, useTouchZoomOverride } from './';


/*
0 unknown
1 touch
2 mouse
*/


export default function useInputDetect() {
  const [state, setState] = useGlobalState();
  const { uiMode } = state;

  void useTouchZoomOverride(uiMode === 1);

  const ref = useRef(null);


  const handleTouch = useCallback(e => {
    e.preventDefault();
    setState('uiMode', 1);
  }, [setState]);


  const handleMouse = useCallback(e => {
    e.preventDefault();
    setState('uiMode', 2);
  }, [setState]);


  useEffect(() => {
    const handleClick = e => e.preventDefault();
    const el = ref.current;
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
  }, [ref, uiMode, handleTouch, handleMouse]);


  const uiReady = useMemo(() => !!uiMode, [uiMode]);


  return {
    uiReady,
    detectionRef: ref,
    uiMode,
  };
};

