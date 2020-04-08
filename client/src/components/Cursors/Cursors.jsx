import React, { memo, useState, useCallback } from 'react';
import './Cursors.css';
// import ColorsCurrent from './ColorsCurrent.jsx';
// import ColorsPalette from './ColorsPalette.jsx';





export default memo(function Cursors({ cursorMode, click = null } = {}) {


  return (
    <div className="Cursors toolbox" onClick={click}>
      <div className="toolbox--inner">
      {['drag', 'paint'].map(d =>
        <div
          key={`cursor-${d}`}
          id={`cursor-${d}`}
          className={`Cursors--button button ${d}${cursorMode === d ? ' active' : ''}`}
        />
      )}
      </div>
    </div>
  );
});




      // {['in', 'out'].map(d =>
      //   <div
      //     key={`zoom-${d}`}
      //     id={`zoom-${d}`}
      //     className={`Cursors--button button ${d}${cursorMode === d ? ' active' : ''}`}
      //   />
      // )}
