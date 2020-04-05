import React, { memo } from 'react';
import './Grid.css';





export default memo(function Grid({ gridRef, click = null } = {}) {
  console.log('grid render')
  return (
    <div id="Grid">
      <div className="Grid--wrap">
        <div
          className="Grid--celbox"
          ref={gridRef}
          // onClick={click}
        />
      </div>
    </div>
  );
});
