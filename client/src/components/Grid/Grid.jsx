import React, { memo, useState, useCallback } from 'react';
import './Grid.css';
import { palette } from '../../global';






const GridCel = memo(function GridCel({ params, active = false, click = null } = {}) {
  const {
    id,
    row,
    col,
    color,
    lastChangeAuthor,
    // lastChangeTime,
  } = params;


  const handleClick = useCallback(e => {
    if (!id) {
      return null;
    };
    click(id);
  }, [id, click]);



  return (
    <div
      id={id}
      // className="Grid--cel"
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





export default memo(function Grid({ grid, post = null } = {}) {
  const [active, setActive] = useState(false);


  const handleClick = useCallback(id => {
    if (id === active) {
      return setActive(false);
    };
    console.log('got clicked', id)
    setActive(id);
  }, [active, setActive]);


  return (
    <div className="Grid--wrap">
      <div id="Grid">
        {grid.map(d =>
          <GridCel
            key={d.id}
            params={d}
            active={d.id === active}
            click={handleClick}
          />
        )}
      </div>
    </div>
  );
});






  // const handleClick = useCallback(e => {
  //   if (!color || !name) {
  //     return null;
  //   };

  //   const msg = {
  //     type: 'paint',
  //     id: e.target.id,
  //     color: color,
  //     author: name,
  //     time: Date.now(),
  //   };
  //   client.send(JSON.stringify(msg));
  // }, [name, color, client]);
