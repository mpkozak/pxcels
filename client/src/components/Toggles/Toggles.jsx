import React, { memo, useMemo, useCallback } from 'react';
import './Toggles.css';
import { cl } from '../../libs';





export default memo(function Toggles({
  cursorMode = 0,
  setCursorMode = null,
  updateZoom = null,
} = {}) {


  const cursorButtons = useMemo(() => {
    return [
      ['cursor-1', cursorMode === 1],
      ['cursor-0', cursorMode === 0],
      ['zoom-0'],
      ['zoom-1'],
    ];
  }, [cursorMode]);


  const handleClickToggle = useCallback(e => {
    const { id } = e.target;
    if (!id) return null;
    const [setting, value] = id.split('-');
    if (setting === 'cursor') {
      return setCursorMode(+value);
    };
    if (setting === 'zoom') {
      return updateZoom(+value);
    };
  }, [setCursorMode, updateZoom]);


  return (
    <div className="Toggles" onClick={handleClickToggle}>
      {cursorButtons.map(([id, active]) =>
        <div
          key={id}
          id={id}
          className={cl(
            'Toggles__button btn btn--sm',
            `Toggles__button--${id}`,
            [active, 'Toggles__button--active'],
          )}
        />
      )}
    </div>
  );
});
