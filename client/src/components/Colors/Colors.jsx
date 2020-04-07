import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Colors({ palette = [], activeColor = 0, setColor = null } = {}) {
  const [hidePalette, setHidePalette] = useState(true);


  const toggleHidePalette = useCallback(() => {
    setHidePalette(!hidePalette);
  }, [hidePalette, setHidePalette]);


  const handleClickSetColor = useCallback((e) => {
    setColor(e);
    toggleHidePalette();
  }, [setColor, toggleHidePalette]);


  return (
    <div className={'Colors' + (!hidePalette ? ' active' : '')}>
      <ColorsPalette
        palette={palette}
        click={handleClickSetColor}
      />
      <div
        className="Colors--current"
        style={{ backgroundColor: palette[activeColor] }}
        onClick={toggleHidePalette}
      />
    </div>
  );
});
