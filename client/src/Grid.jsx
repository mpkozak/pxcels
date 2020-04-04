import React, { memo, useState, useCallback } from 'react';
import './Grid.css';
import params from './_params.js'
const { palette } = params;






const GridCel = memo(function GridCel({ params, click } = {}) {
  const {
    id,
    row,
    col,
    color,
    lastChangeAuthor,
    // lastChangeTime,
  } = params;


  const [active, setActive] = useState(false);


  const handleClick = useCallback(e => {
    setActive(true);
  }, [setActive])



  return (
    <div
      id={id}
      className="Grid--cel"
      className={'Grid--cel' + (active ? ' active' : '')}
      style={{
        left: col * 30 + 'px',
        top: row * 30 + 'px',
        backgroundColor: palette[color],
      }}
      // onClick={click}
      onClick={handleClick}
    >
      <h6>{lastChangeAuthor}</h6>
    </div>
  );
});





export default memo(function Grid({ uuid, name, color, grid = [], client } = {}) {

  const handleClick = useCallback(e => {
    if (!color || !name) {
      return null;
    };

    const msg = {
      type: 'paint',
      id: e.target.id,
      color: color,
      author: name,
      time: Date.now(),
    };
    client.send(JSON.stringify(msg));
  }, [name, color, client]);


  return (
    <div className="Grid--wrap">
    <div id="Grid">
      {grid.map(d =>
        <GridCel key={d.id} params={d} click={handleClick} />
      )}
    </div>
    </div>
  );
});
