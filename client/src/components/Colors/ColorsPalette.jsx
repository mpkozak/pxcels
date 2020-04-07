import React, { memo } from 'react';





export default memo(function ColorsPalette({ palette = [], click = null } = {}) {


  return (
    <div className="ColorsPalette" onClick={click}>
      {palette.map((hex, i) =>
        <div
          key={hex}
          id={`color-${i}`}
          className="ColorsPalette--cel"
          style={{ backgroundColor: hex }}
        />
      )}
    </div>
  );
});
