import React, { memo, useCallback } from 'react';
import './Grid.css';





export default memo(function Grid({ gridRef, post = null, color } = {}) {

  const handleClick = useCallback(e => {
    const { id } = e.target;
    if (!id || !color) {
      return null;
    };
    post('set_cel', { id, color, t: Date.now() });
  }, [post, color]);


  return (
    <div className="Grid--wrap">
      <div id="Grid" ref={gridRef} onClick={handleClick} />
    </div>
  );
});
