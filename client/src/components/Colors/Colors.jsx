import React, { memo, useState, useCallback } from 'react';
import './Colors.css';
import ColorsCurrent from './ColorsCurrent.jsx';
import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Colors({ palette = [], activeColor = 0, setColor = null } = {}) {
  const [hidePalette, setHidePalette] = useState(true);


  const toggleHidePalette = useCallback(() => {
    setHidePalette(!hidePalette);
  }, [hidePalette, setHidePalette]);


  // const handleClickSetColor = useCallback((e) => {
  //   setColor(e);
  //   toggleHidePalette();
  // }, [setColor, toggleHidePalette]);


  return (
    <div className="Colors">
      <div className={'Colors--inner' + (hidePalette ? ' hide' : '')}>
        <ColorsCurrent
          color={palette[activeColor]}
          click={toggleHidePalette}
        />
        <ColorsPalette
          // hide={hidePalette}
          palette={palette}
          // click={handleClickSetColor}
          click={setColor}
        />
      </div>
    </div>
  );
});
