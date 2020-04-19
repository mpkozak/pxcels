import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import { ColorsButton, ColorsPalette, ColorsCelbox } from './';





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
      <ColorsButton
        uiMode={uiMode}
        color={colors[activeColor]}
        togglePalette={togglePalette}
      />
      <ColorsPalette uiMode={uiMode} active={showPalette}>
        <ColorsCelbox
        active={showPalette}
        colors={colors}
        clickColor={handleClickColor}
        hidePalette={hidePalette}
        uiMode={uiMode}
        mouse={uiMode === 2}
        touch={uiMode === 1}


        />
      </ColorsPalette>
    </div>
  );
});
