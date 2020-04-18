import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  // useRef,
  useMemo,
  // useState,
  // useReducer,
  // useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import './Toggles.css';
import { cl } from '../../libs';





export default memo(function Toggles({
  cursorMode,
  dispatchCursor = null,
  dispatchZoom = null,
} = {}) {


  const cursorButtons = useMemo(() => {
    return [
      ['cursor-1', cursorMode === 1],
      ['cursor-0', cursorMode === 0],
      ['zoom-0'],
      ['zoom-1'],
    ];
  }, [cursorMode]);


  const handleClickToggle = useCallback(e => {
    const { id } = e.target;
    if (!id) return null;
    const [setting, value] = id.split('-');
    if (setting === 'cursor') {
      return dispatchCursor(+value);
    };
    if (setting === 'zoom') {
      return dispatchZoom(+value);
    };
  }, [dispatchCursor, dispatchZoom]);


  return (
    <div className="Toggles" onClick={handleClickToggle}>
      {cursorButtons.map(([id, enabled]) =>
        <div
          key={id}
          id={id}
          className={cl(
            'Toggles--button',
            id,
            'button',
            'button--small',
            'button--small-icon',
            'button--small-icon__mouse',
            { enabled },
          )}
        />
      )}
    </div>
  );
});
