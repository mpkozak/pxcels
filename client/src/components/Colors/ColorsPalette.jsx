import React, { memo } from 'react';





export default memo(function ColorsPalette({ palette = [], hide = true, click = null } = {}) {
  return (
    <div className="Colors--palette">
      <div
        // className={'Colors--palette-celbox ' + (hide ? 'hide' : 'show')}
        // className={'Colors--palette-celbox' + (hide ? ' hide' : '')}
        className="Colors--palette-celbox"
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
