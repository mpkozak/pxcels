import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import { ColorsCurrent, ColorsPalette } from './';





export default memo(function Colors({
  colors = [],
  activeColor = 0,
  clickColor = null,
  hasMouse = false,
} = {}) {

  const [showPalette, setShowPalette] = useState('');

  const togglePalette = useCallback(() => {
    setShowPalette(!showPalette);
  }, [showPalette, setShowPalette]);

  const hidePalette = useCallback(() => {
    setShowPalette(false);
  }, [setShowPalette]);


  return (
    <div className="Colors">
      <ColorsCurrent
        color={colors[activeColor]}
        togglePalette={togglePalette}
        hasMouse={hasMouse}
      />
      <ColorsPalette
        show={showPalette}
        colors={colors}
        clickColor={clickColor}
        hidePalette={hidePalette}
        hasMouse={hasMouse}
      />
    </div>
  );
});
