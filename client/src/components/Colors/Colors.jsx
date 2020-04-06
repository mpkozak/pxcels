import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Colors({ colorRef, palette = [] } = {}) {
  // console.log('colors render')

  const [activeColor, setActiveColor] = useState(colorRef.current);
  const [showPalette, setShowPalette] = useState(true);


  const handleClickSetColor = useCallback(color => {
    colorRef.current = color;
    setActiveColor(color);
    setShowPalette(false);
  }, [colorRef, setActiveColor]);


  const handleClickTogglePalette = useCallback(() => {
    setShowPalette(!showPalette);
  }, [showPalette, setShowPalette]);


  return (
    <div className={'Colors' + (showPalette ? ' active' : '')}>
      <ColorsPalette
        palette={palette}
        hidden={!showPalette}
        click={handleClickSetColor}
      />
      <div
        className={'Colors--current' + (showPalette ? ' hidden' : '')}
        style={{ backgroundColor: palette[activeColor] }}
        onClick={handleClickTogglePalette}
      />
    </div>
  );
});
