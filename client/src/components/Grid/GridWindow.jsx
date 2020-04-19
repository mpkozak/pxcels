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





export default memo(function GridWindow({
  uiMode = 0,
  windowRef = null,
  startDragging = null,
  children,
} = {}) {


  return (
    <div
      className="Grid__window"
      ref={windowRef}
      {...(uiMode === 2 && { onMouseDown: startDragging })}
    >
      <div className="Grid__flex-wrap">
        <div className="Grid__flex">
          {children}
        </div>
      </div>
    </div>
  );
});
