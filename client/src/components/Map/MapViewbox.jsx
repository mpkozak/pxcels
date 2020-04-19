import React, {
  memo,
} from 'react';





export default memo(function MapViewbox({
  viewboxRef = null,
} = {}) {


  return (
    <div className="Map__viewbox" ref={viewboxRef} />
  );
});
