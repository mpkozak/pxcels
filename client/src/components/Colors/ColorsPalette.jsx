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
import { cl } from '../../libs';





export default memo(function ColorsPalette({
  active = null,
  uiMode = 0,
  children,
} = {}) {


  return (
    <div
      className={cl(
        'Colors__palette',
        [uiMode === 2, 'Colors__palette--touch'],
        [active, 'Colors__palette--active'],
      )}
    >
      {children}
    </div>
  );
});
