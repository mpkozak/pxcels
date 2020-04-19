import React, {
  memo,
} from 'react';
import { cl } from '../../libs';





export default memo(function MapBlackout({
  active = false,
  hideMap = null,
} = {}) {


  return (
    <div
      className={cl(
        'Map__blackout',
        [active, 'Map__blackout--visible']
      )}
      onClick={hideMap}
    />
  );
});
