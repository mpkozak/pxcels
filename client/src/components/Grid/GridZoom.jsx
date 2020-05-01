import React, { memo } from 'react';





export default memo(function GridZoom({
  gridRef = null,
  gridStyle = {},
  zoomListeners = {},
  children,
} = {}) {


  return (
    <div
      className="Grid__zoom"
      ref={gridRef}
      style={gridStyle}
      {...zoomListeners}
    >
      {children}
    </div>
  );
});
