import React, { memo, useCallback } from 'react';
import './Grid.css';





export default memo(function Grid({ gridRef, post = null, color } = {}) {

  const handleClick = useCallback(e => {
    const { id } = e.target;
    if (!id || !color) {
      return null;
    };

    post('set_cel', { id, color, t: Date.now() });
  }, [post, color]);


  return (
    <div className="Grid--wrap">
      <div id="Grid" ref={gridRef} onClick={handleClick} />
    </div>
  );
});











// const GridCel = memo(function GridCel({ params, active = false, click = null } = {}) {
//   const {
//     id,
//     row,
//     col,
//     color,
//     lastChangeAuthor,
//     // lastChangeTime,
//   } = params;


//   const handleClick = useCallback(e => {
//     if (!id) {
//       return null;
//     };
//     click(id);
//   }, [id, click]);



//   return (
//     <div
//       id={id}
//       // className="Grid--cel"
//       className={'Grid--cel' + (active ? ' active' : '')}
//       style={{
//         left: col * 30 + 'px',
//         top: row * 30 + 'px',
//         backgroundColor: palette[color],
//       }}
//       // onClick={click}
//       onClick={handleClick}
//     >
//       <h6>{lastChangeAuthor}</h6>
//     </div>
//   );
// });





// export default memo(function Grid({ grid, post = null, color } = {}) {

//   const gridRef = useRef(null);

//   console.log('grid render')




//   const draw = useCallback(() => {
//     const el = gridRef.current;
//     if (!el) {
//       console.log('cannot draw yet')
//       return null;
//     };

//     console.log('drawing')

//     const node = d3.select(el)

//     node
//       .selectAll('div')
//         .data(grid)
//         .attr('id', d => d.id)
//         .attr('class', 'Grid--cel')
//         .style('left', d => d.col * 30 + 'px')
//         .style('top', d => d.row * 30 + 'px')
//         .style('background-color', d => palette[d.color])
//       .enter()
//         .append('div')
//         .attr('id', d => d.id)
//         .attr('class', 'Grid--cel')
//         .style('left', d => d.col * 30 + 'px')
//         .style('top', d => d.row * 30 + 'px')
//         .style('background-color', d => palette[d.color])
//       .exit()
//         .remove();
//   }, [grid, gridRef]);





//   // useEffect(() => {
//   //   console.log('grtid effect')
//   //   if (grid) {
//   //     draw();
//   //   };
//   // }, [grid, draw]);

//   useEffect(() => {
//     console.log('grtid effect')
//     if (grid) {
//       draw();
//     };
//   });

//   // draw()

//   const handleClick = useCallback(e => {
//     const { id } = e.target;
//     if (!id || !color) {
//       return null;
//     };

//     post('set_cel', { id, color, t: Date.now() });
//   }, [post, color]);




//   return (
//     <div className="Grid--wrap">
//       <div id="Grid" ref={gridRef} onClick={handleClick}>

//       </div>
//     </div>
//   );
// });



  // const [active, setActive] = useState(false);

  // const handleClick = useCallback(id => {
  //   if (id === active) {
  //     return setActive(false);
  //   };
  //   console.log('got clicked', id)
  //   setActive(id);
  // }, [active, setActive]);





        // {grid.map(d =>
        //   <GridCel
        //     key={d.id}
        //     params={d}
        //     active={d.id === active}
        //     click={handleClick}
        //   />
        // )}





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
