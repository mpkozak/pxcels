import React, { memo } from 'react';
import './Cursors.css';



export default memo(function Cursors({ cursorMode, click = null } = {}) {

  return (
    <div className="Tool--wrap Cursors" onClick={click}>
      <div className="Tool Cursors--inner">
        {['paint', 'drag'].map(d =>
          <div
            key={`cursor-${d}`}
            id={`cursor-${d}`}
            className={`Cursors--button ${d}${cursorMode === d ? ' active' : ''}`}
          />
        )}
        <div id="zoom-0" className="Cursors--button zoom-out" />
        <div id="zoom-1" className="Cursors--button zoom-in" />
      </div>
    </div>
  );
});
