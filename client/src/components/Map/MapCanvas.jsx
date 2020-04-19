import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  // useRef,
  // useMemo,
  // useState,
  // useReducer,
  // useEffect,
  // useLayoutEffect,
  // useCallback,
} from 'react';
// import { cl } from '../../libs';





export default memo(function MapCanvas({
  canvasRef = null,
} = {}) {


  return (
    <canvas className="Map__canvas" ref={canvasRef} />
  );
});
