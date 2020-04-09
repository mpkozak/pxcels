import React, { memo } from 'react';





export default memo(function ColorsPalette({ palette = [], show = '', click = null } = {}) {
  return (
    <div className="Colors--palette">
      <div
        className={
          'Colors--palette-celbox' +
          (show === '' ? ' notready' : '') +
          (!show ? ' hide' : '')
        }
        onClick={click}
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
