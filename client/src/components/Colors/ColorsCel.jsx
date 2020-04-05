import React, { memo, useCallback } from 'react';





export default memo(function ColorsCel({ name, hex, active = false, click = null } = {}) {
  console.log('colorscel render')

  const handleClick = useCallback(e => {
    return click(name);
  }, [name, click]);


  return (
    <div
      // className={'ColorsCel' + (active ? ' active' : '')}
      className="ColorsCel"
      style={{ backgroundColor: hex }}
      onClick={handleClick}
    />
  );
});
