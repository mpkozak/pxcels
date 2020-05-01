import React, { memo, useMemo, useState, useCallback } from 'react';
import './Colors.css';
import { useGlobalContext } from '../../hooks';
import { cl } from '../../libs';
import { ColorsButton, ColorsPalette } from './';





export default memo(function Colors({
  activeColor = 0,
  setActiveColor = null,
} = {}) {


  const [context] = useGlobalContext();
  const {
    colors,
    uiMode,
  } = context;


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
    if (uiMode === 1) {
      hidePalette();
    };
    setActiveColor(color);
  }, [uiMode, hidePalette, setActiveColor]);


  const paletteCels = useMemo(() => colors.map((hex, i) =>
    <div
      key={hex}
      id={`color-${i}`}
      className={cl(
        'Colors__cel btn btn--sm',
        [uiMode === 2, 'Colors__cel--mouse'],
      )}
      style={{ backgroundColor: hex }}
    />
  ), [colors, uiMode]);


  return (
    <div className="Colors">
      <ColorsButton
        uiMode={uiMode}
        color={colors[activeColor]}
        togglePalette={togglePalette}
      />
      <ColorsPalette
        uiMode={uiMode}
        active={showPalette}
        clickColor={handleClickColor}
        hidePalette={hidePalette}
      >
        {paletteCels}
      </ColorsPalette>
    </div>
  );
});
