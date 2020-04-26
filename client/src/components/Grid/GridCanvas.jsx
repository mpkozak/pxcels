import React, { memo } from 'react';





export default memo(function GridCanvas({
  canvasRef = null,
  canvasStyle = {},
  paintCel = null,
  tooltipCel = null,
} = {}) {


  return (
    <canvas
      className="Grid__canvas"
      ref={canvasRef}
      style={canvasStyle}
      onClick={paintCel}
      onMouseMove={tooltipCel}
    />
  );
});
