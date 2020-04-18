import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import { ColorsCurrent, ColorsPalette } from './';





export default memo(function Colors({
  colors,
  activeColor,
  uiMode,
  dispatch,
} = {}) {

  const [showPalette, setShowPalette] = useState(null);


  const togglePalette = useCallback(() => {
    setShowPalette(!showPalette);
  }, [showPalette, setShowPalette]);


  const hidePalette = useCallback(() => {
    setShowPalette(false);
  }, [setShowPalette]);


  const handleClickColor = useCallback(e => {
    const { id } = e.target;
    if (!id) return null;
    const color = +id.split('-')[1];
    dispatch(color);
  }, [dispatch]);


  return (
    <div className="Colors">
      <ColorsCurrent
        color={colors[activeColor]}
        togglePalette={togglePalette}
        mouse={uiMode === 2}
      />
      <ColorsPalette
        active={showPalette}
        colors={colors}
        clickColor={handleClickColor}
        hidePalette={hidePalette}
        mouse={uiMode === 2}
        touch={uiMode === 1}
      />
    </div>
  );
});
