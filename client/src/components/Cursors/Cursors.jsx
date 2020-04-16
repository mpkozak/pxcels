import React, { memo, useMemo } from 'react';
import './Cursors.css';





export default memo(function Cursors({
  cursorMode,
  clickCursor = null,
  hasMouse = false,
} = {}) {

  const cursorButtons = useMemo(() => {
    return [
      ['cursor-paint', cursorMode === 'paint'],
      ['cursor-drag', cursorMode === 'drag'],
      ['zoom-0'],
      ['zoom-1'],
    ];
  }, [cursorMode]);


  return (
    <div className="Cursors" onClick={clickCursor}>
      {cursorButtons.map(([id, enabled]) =>
        <div
          key={id}
          id={id}
          className={
            `Cursors--button ${id}`
            + ' button'
            + ' button--small'
            + ' button--small-icon'
            + (hasMouse ? ' button--small-icon__mouse' : '')
            + (enabled ? ' enabled' : '')
          }
        />
      )}
    </div>
  );
});
