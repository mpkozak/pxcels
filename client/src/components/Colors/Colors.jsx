import React, { memo } from 'react';
import './Colors.css';
import { palette } from '../../global';
import ColorsCel from './ColorsCel.jsx';





export default memo(function Colors({ activeColor, handleColor = null } = {}) {
  console.log('colors render')
  return (
    <div id="Colors">
      <div className="Colors--celbox">
        {Object.entries(palette).map(([name, hex]) =>
          <ColorsCel
            key={hex}
            name={name}
            hex={hex}
            active={activeColor === name}
            click={handleColor}
          />
        )}
      </div>
    </div>
  );
});
