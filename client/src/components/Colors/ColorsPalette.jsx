import React, { memo } from 'react';
import './Colors.css';





export default memo(function ColorsPalette({ palette = [], hidden = false, click = null } = {}) {
  // console.log('ColorsPalette render')

  return (
      <div className="ColorsPalette">
        {palette.map((hex, i) =>
          <div
            key={hex}
            className="ColorsPalette--cel"
            style={{ backgroundColor: hex }}
            onClick={() => click(i)}
          />
        )}
      </div>
  );
});
