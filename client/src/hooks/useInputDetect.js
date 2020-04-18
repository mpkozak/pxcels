import {
  // Fragment,
  // createContext,
  // memo,
  // useContext,
  // useRef,
  // useMemo,
  useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import { useTouchZoomOverride } from './';


/*
0 unknown
1 touch
2 mouse
*/


export default function useInputDetect(ref = null) {
  const [uiMode, setUiMode] = useState(0);


  void useTouchZoomOverride(uiMode === 1);


  const handleTouch = useCallback(e => {
    e.preventDefault();
    setUiMode(1);
  }, [setUiMode]);


  const handleMouse = useCallback(e => {
    e.preventDefault();
    setUiMode(2);
  }, [setUiMode]);


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


  return {
    uiMode,
  };
};
