import React, {
  Fragment,
  createContext,
  memo,
  useContext,
  useRef,
  useMemo,
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
// import { cl } from '../../libs';





export default memo(function GridWindow({
  canvasRef = null,
  canvasStyle = {},
  paintCel = null,

} = {}) {


/*
    TOUCH EVENTS
*/





  return (
    <canvas
      className="Grid__canvas"
      ref={canvasRef}
      style={canvasStyle}
      onClick={paintCel}
    />
  );
});
