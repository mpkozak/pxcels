import React, { memo } from 'react';





export default memo(function GridCanvas({
  canvasRef = null,
  canvasStyle = {},
  paintCel = null,
  showTooltip = null,
} = {}) {


  return (
    <canvas
      className="Grid__canvas"
      ref={canvasRef}
      style={canvasStyle}
      onClick={paintCel}
      onMouseMove={showTooltip}
    />
  );
});
