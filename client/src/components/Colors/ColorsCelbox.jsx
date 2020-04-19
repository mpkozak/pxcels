import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  // useRef,
  useMemo,
  useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import { cl } from '../../libs';





export default memo(function ColorsCelbox({
  active = null,
  colors = [],
  clickColor = null,
  hidePalette = null,
  uiMode = 0,
  mouse = false,
  touch = false,
} = {}) {

  const [touchStartX, setTouchtouchStartX] = useState(null);


  const handleClick = useCallback(e => {
    clickColor(e);
    if (touch && e.target.id) {
      hidePalette();
    };
  }, [clickColor, hidePalette, touch]);


  const handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    const { clientX } = targetTouches[0];
    setTouchtouchStartX(clientX);
  }, [setTouchtouchStartX]);


  const handleTouchEnd = useCallback(e => {
    setTouchtouchStartX(null);
  }, [setTouchtouchStartX]);


  const handleTouchMove = useCallback(e => {
    // e.stopPropagation();
    e.preventDefault();
    const { targetTouches } = e;
    const { clientX } = targetTouches[0];
    const deltaX = touchStartX - clientX;
    if (deltaX > 10) {
      // e.preventDefault();
      e.stopPropagation();
      setTouchtouchStartX(null);
      hidePalette();
    };
  }, [touchStartX, setTouchtouchStartX, hidePalette]);


  useEffect(() => {
    if (touchStartX) {
      window.addEventListener('touchcancel', handleTouchEnd);
    };

    return () => {
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [touchStartX, handleTouchEnd]);


  const paletteCels = useMemo(() => colors.map((hex, i) =>
    <div
      key={hex}
      id={`color-${i}`}
      className={cl(
        'Colors__cel btn btn--sm',
        [uiMode === 2, 'Colors__cel--mouse']
      )}
      style={{ backgroundColor: hex }}
    />
  ), [colors, uiMode]);


  return (
    <div
      className={cl(
        'Colors__celbox',
        [active === null, 'Colors__celbox--not-ready'],
        [!active, 'Colors__celbox--hide'],
      )}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {paletteCels}
    </div>
  );
});
