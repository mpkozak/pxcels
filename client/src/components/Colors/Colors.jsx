import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import ColorsCurrent from './ColorsCurrent.jsx';
import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Colors({ palette = [], activeColor = 0, setColor = null } = {}) {
  const [showPalette, setShowPalette] = useState('');
console.log('test', !showPalette)

  const toggleHidePalette = useCallback(() => {
    setShowPalette(!showPalette);
  }, [showPalette, setShowPalette]);


  // const handleClickSetColor = useCallback((e) => {
  //   setColor(e);
  //   toggleHidePalette();
  // }, [setColor, toggleHidePalette]);


  return (
    <div className="Colors toolbox">
      <div className="toolbox--inner">
        <ColorsCurrent
          color={palette[activeColor]}
          click={toggleHidePalette}
        />
        <ColorsPalette
          show={showPalette}
          palette={palette}
          click={setColor}
        />
      </div>
    </div>
  );
});
