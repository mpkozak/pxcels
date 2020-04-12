import React, { memo, useState, useEffect, useCallback, useRef } from 'react';





export default memo(function ColorsPalette({ palette = [], show = '', click = null, toggleHide = null } = {}) {
  const [startX, setStartX] = useState(null);
  // const touchRef = useRef(null);


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


  // useEffect(() => {
  //   const touchEl = touchRef.current;
  //   if (touchEl && startX) {
  //     touchEl.addEventListener('touchmove', handleTouchMove, { passive: true });
  //     touchEl.addEventListener('touchend', handleTouchEnd);
  //     touchEl.addEventListener('touchcancel', handleTouchEnd);
  //   };

  //   return () => {
  //     if (touchEl) {
  //       touchEl.removeEventListener('touchmove', handleTouchMove);
  //       touchEl.removeEventListener('touchend', handleTouchEnd);
  //       touchEl.removeEventListener('touchcancel', handleTouchEnd);
  //     };
  //   };
  // }, [touchRef, startX, handleTouchMove, handleTouchEnd]);




  useEffect(() => {
    if (startX) {
      window.addEventListener('touchcancel', handleTouchEnd);
    };

    return () => {
      window.removeEventListener('touchcancel', handleTouchEnd);
    }
  }, [startX, handleTouchEnd]);





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
        {palette.map((hex, i) =>
          <div
            key={hex}
            id={`color-${i}`}
            className="Colors--palette-cel"
            style={{ backgroundColor: hex }}
          />
        )}
      </div>
    </div>
  );
});
