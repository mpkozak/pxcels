import React, {
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';





export default memo(function ColorsPalette({
  colors = [],
  show = '',
  clickColor = null,
  hidePalette = null,
  hasMouse = false,
} = {}) {

  const [touchStartX, setTouchtouchStartX] = useState(null);

  const handleClick = useCallback(e => {
    clickColor(e);
    if (!hasMouse && e.target.id) {
      hidePalette();
    };
  }, [clickColor, hidePalette, hasMouse]);

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
      className={
        'Colors--palette-cel'
        + ' button'
        + ' button--small'
        + (hasMouse ? ' button--small-color__mouse' : '')
      }
      style={{ backgroundColor: hex }}
    />
  ), [colors, hasMouse]);


  return (
    <div
      className={
        'Colors--palette'
        + (!hasMouse ? ' touch' : '')
        + (show ? ' active' : '')
      }
    >
      <div
        className={
          'Colors--palette-celbox'
          + (show === '' ? ' notready' : '')
          + (!show ? ' hide' : '')
        }
        // onClick={clickColor}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {paletteCels}
      </div>
    </div>
  );
});
