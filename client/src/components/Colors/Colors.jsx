import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import ColorsCurrent from './ColorsCurrent.jsx';
import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Colors({ palette = [], activeColor = 0, setColor = null } = {}) {
  const [showPalette, setShowPalette] = useState('');

  const toggleHidePalette = useCallback(() => {
    setShowPalette(!showPalette);
  }, [showPalette, setShowPalette]);


  return (
    <div className="Tool--wrap Colors">
      <div className="Tool Colors--inner">
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
