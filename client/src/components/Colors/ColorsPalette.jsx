import React, {
  // Fragment,
  memo,
  // useRef,
  useMemo,
  useState,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';





export default memo(function ColorsPalette({
  palette = [],
  show = '',
  click = null,
  toggleHide = null
} = {}) {

  const [startX, setStartX] = useState(null);


  const handleTouchStart = useCallback(e => {
    const { targetTouches } = e;
    const { clientX } = targetTouches[0];
    setStartX(clientX);
  }, [setStartX]);


  const handleTouchEnd = useCallback(e => {
    setStartX(null);
  }, [setStartX]);


  const handleTouchMove = useCallback(e => {
    e.stopPropagation();
    const { targetTouches } = e;
    const { clientX } = targetTouches[0];
    const deltaX = startX - clientX;
    if (deltaX > 10) {
      setStartX(null);
      toggleHide();
    };
  }, [startX, setStartX, toggleHide]);


  useEffect(() => {
    if (startX) {
      window.addEventListener('touchcancel', handleTouchEnd);
    };

    return () => {
      window.removeEventListener('touchcancel', handleTouchEnd);
    }
  }, [startX, handleTouchEnd]);



  // const celboxCl = useMemo(() => ())

  const paletteCels = useMemo(() => palette.map((hex, i) =>
    <div
      key={hex}
      id={`color-${i}`}
      className="Colors--palette-cel"
      style={{ backgroundColor: hex }}
    />
  ), [palette]);


  return (
    <div className="Colors--palette">
      <div
        className={
          'Colors--palette-celbox' +
          (show === '' ? ' notready' : '') +
          (!show ? ' hide' : '')
        }
        onClick={click}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {paletteCels}
      </div>
    </div>
  );
});
