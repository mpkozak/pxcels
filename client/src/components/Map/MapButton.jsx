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





export default memo(function MapButton({
  uiMode = 0,
  active = false,
  showMap = null,
  children,
} = {}) {


  return (
    <div
      className={cl(
        'Map__button btn btn--lg',
        [uiMode === 2, 'Map__button--mouse'],
        [!active, 'Map__button--inactive'],
      )}
      onClick={showMap}
    >
      <div
        className={cl(
          'Map__panner',
          [!active, 'Map__panner--inactive']
        )}
      >
        {children}
      </div>
    </div>
  );
});
