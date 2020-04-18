import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import { useGlobalState } from '../../hooks';
import { ColorsCurrent, ColorsPalette } from './';





export default memo(function Colors() {
  const [state, setState] = useGlobalState();
  const {
    colors,
    activeColor,
    uiMode,
  } = state;

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
    setState('activeColor', color);
  }, [setState]);


  return (
    <div className="Colors">
      <ColorsCurrent
        color={colors[activeColor]}
        togglePalette={togglePalette}
        hasMouse={uiMode === 2}
      />
      <ColorsPalette
        active={showPalette}
        colors={colors}
        clickColor={handleClickColor}
        hidePalette={hidePalette}
        hasMouse={uiMode === 2}
        touch={uiMode === 1}
      />
    </div>
  );
});
