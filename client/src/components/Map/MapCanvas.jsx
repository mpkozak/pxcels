import React, {
  memo,
} from 'react';





export default memo(function MapCanvas({
  canvasRef = null,
} = {}) {


  return (
    <canvas className="Map__canvas" ref={canvasRef} />
  );
});
