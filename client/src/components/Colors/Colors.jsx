import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Colors({ activeColor, setColor = null } = {}) {
  // console.log('colors render')

  const [showPalette, setShowPalette] = useState(true);



  const handleClickSetColor = useCallback(color => {
    setColor(color);
    setShowPalette(false);
  }, [setColor, setShowPalette]);


  const handleClickTogglePalette = useCallback(() => {
    setShowPalette(!showPalette);
  }, [showPalette, setShowPalette])


  return (
    <div id="Colors">
      <div
        className="ColorsActive"
        style={{
          backgroundColor: activeColor,
          opacity: !activeColor ? 0 : 1,
        }}
        onClick={handleClickTogglePalette}
      />
      <ColorsPalette
        hidden={!showPalette}
        click={handleClickSetColor}
      />
    </div>
  );
});
