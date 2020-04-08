import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
// import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Colors({ palette = [], activeColor = 0, setColor = null } = {}) {
  const [hidePalette, setHidePalette] = useState(false);


  const toggleHidePalette = useCallback(() => {
    setHidePalette(!hidePalette);
  }, [hidePalette, setHidePalette]);


  const handleClickSetColor = useCallback((e) => {
    setColor(e);
    toggleHidePalette();
  }, [setColor, toggleHidePalette]);


  return (
    <div className="Colors">
      <div
        className="Colors--current"
        style={{ backgroundColor: palette[activeColor] }}
        onClick={toggleHidePalette}
      />
      <div className="Colors--palette">
        <div
          className={'Colors--palette-celbox' + (hidePalette ? ' hide' : '')}
          onClick={handleClickSetColor}
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
    </div>
  );
});
