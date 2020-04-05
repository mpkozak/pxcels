import React, { memo } from 'react';
import './Colors.css';
import { palette } from '../../global';





export default memo(function ColorsPalette({ hidden = false, click = null } = {}) {
  // console.log('ColorsPalette render')

  return (
    <div className={'ColorsPalette--wrap' + (hidden ? ' hidden' : '')}>
      <div className="ColorsPalette">
        {Object.entries(palette).map(([name, hex]) =>
          <div
            key={name}
            className="ColorsPalette--cel"
            style={{ backgroundColor: hex }}
            onClick={() => click(name)}
          />
        )}
      </div>
    </div>
  );
});
