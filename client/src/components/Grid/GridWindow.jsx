import React, { memo, useMemo } from 'react';
import { cl } from '../../libs';





export default memo(function GridWindow({
  uiMode = 0,
  windowRef = null,
  startDragging = null,
  children,
} = {}) {


  const flexCl = useMemo(() => {
    return cl(
      'Grid__flex',
      [uiMode === 1, 'Grid__flex--touch']
    );
  }, [uiMode]);


  return (
    <div
      className="Grid__window"
      ref={windowRef}
      {...(uiMode === 2 && { onMouseDown: startDragging })}
    >
      <div className="Grid__flex-wrap">
        <div className={flexCl}>
          {children}
        </div>
      </div>
    </div>
  );
});
