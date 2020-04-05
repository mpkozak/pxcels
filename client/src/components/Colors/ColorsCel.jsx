import React, { memo, useCallback } from 'react';





export default memo(function GridCel({ name, hex, active = false, click = null } = {}) {

  const handleClick = useCallback(e => {
    return click(name);
  }, [name, click]);


  return (
    <div
      className={'ColorsCel' + (active ? ' active' : '')}
      style={{ backgroundColor: hex }}
      onClick={handleClick}
    />
  );
});
