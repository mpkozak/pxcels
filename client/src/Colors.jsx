import React, { memo, useCallback } from 'react';
import './Colors.css';
import params from './_params.js'
const { palette } = params;





const ColorCel = memo(function GridCel({ name, hex, active = false, click = null } = {}) {

  const handleClick = useCallback(e => {
    click(name);
  }, [name, click]);


  return (
    <div
      className={'Colors--cel' + (active ? ' active' : '')}
      style={{ backgroundColor: hex }}
      onClick={handleClick}
    />
  );
});





export default memo(function Colors({ userColor = '', handleColor = null } = {}) {

  return (
    <div id="Colors">
      <div className="Colors--celbox">
        {Object.entries(palette).map(([name, hex]) =>
          <ColorCel
            key={hex}
            name={name}
            hex={hex}
            active={userColor === name}
            click={handleColor}
          />
        )}
      </div>
    </div>
  );
});




      // <div className="Colors--selection">
      //   <h2 className="Colors--selection-pick">Pick a color:</h2>
      //   <h3 className="Colors--selection-name" style={{ color: palette[userColor] }}>
      //     {userColor}
      //   </h3>
      // </div>
