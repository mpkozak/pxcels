import React, { memo, useMemo, useState, useCallback } from 'react';
import { cl } from '../../libs';





export default memo(function ColorsPalette({
  uiMode = 0,
  active = false,
  clickColor = null,
  hidePalette = null,
  children,
} = {}) {


  const [initialTouch, setInitialTouch] = useState(null);


  const getTouchXY = useCallback(e => {
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    return [clientX, clientY];
  }, []);


  const getTouchDelta = useCallback(([x1, y1]) => {
    if (!initialTouch) return null;
    const [x0, y0] = initialTouch;
    return [x1 - x0, y1 - y0];
  }, [initialTouch]);


  const handleTouchStart = useCallback(e => {
    setInitialTouch(getTouchXY(e));
  }, [getTouchXY, setInitialTouch]);


  const handleTouchEnd = useCallback(e => {
    setInitialTouch(null);
  }, [setInitialTouch]);


  const handleTouchMove = useCallback(e => {
    if (!initialTouch) return null;
    e.preventDefault();
    const pos = getTouchXY(e);
    const [deltaX, deltaY] = getTouchDelta(pos);
    if (deltaX < -15 || (deltaY > 50 && deltaX < 15)) {
      e.stopPropagation();
      setInitialTouch(null);
      hidePalette();
    };
  }, [getTouchXY, getTouchDelta, initialTouch, setInitialTouch, hidePalette]);


  const paletteCl = useMemo(() => cl(
    'Colors__palette',
    [uiMode === 1, 'Colors__palette--touch'],
    [active, 'Colors__palette--active'],
  ), [uiMode, active]);


  const celboxCl = useMemo(() => cl(
    'Colors__celbox',
    [active === null, 'Colors__celbox--not-ready'],
    [!active, 'Colors__celbox--hide'],
  ), [active]);


  const touchListeners = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };


  return (
    <div className={paletteCl}>
      <div
        className={celboxCl}
        onClick={clickColor}
        {...(uiMode === 1 && touchListeners)}
      >
        {children}
      </div>
    </div>
  );
});
