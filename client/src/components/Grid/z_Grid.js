import React, { Fragment, memo, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './Grid.css';



const clamp = ([min, max], total, padding = 5) => {
  return ([
    Math.max(0, Math.floor(min - padding)),
    Math.min(total, Math.ceil(max + padding))
  ]);
};


const Cels = memo(({} = {}) => {

})




const CelRow = memo(({ cels = [] } = {}) => {
  console.log("cel row render")
  return (
    <Fragment>
      {cels}
    </Fragment>
  );
});



// const CelRow = memo(({ cels = [] } = {}) => cels)





// const RenderChildren = memo(({ rows = [], cols = [] } = {}) => {
//   return (
//     <Fragment>
//       {cels.slice(...rows).map(d => d.slice(...cols)).flat().map(d => d)}
//     </Fragment>
//   );
// });




function usePagination({ cels, width, height, celScale, windowRef } = {}) {
  // const [rows, setRows] = useState([]);
  const [celView, setCelView] = useState({});

  // const rowsMemo =
  // const
// const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);






  const calcVisible = useCallback((target) => {
    const {
      clientWidth,
      clientHeight,
      scrollWidth,
      scrollHeight,
      scrollLeft,
      scrollTop,
    } = target;
    const scalarX = scrollWidth / width;
    const scalarY = scrollHeight / height;
    const x = [scrollLeft, scrollLeft + clientWidth];
    const y = [scrollTop, scrollTop + clientHeight];

    const colsRaw = x.map(d => d / scalarX)
    const rowsRaw = y.map(d => d / scalarY)

    const out = {
      cols: clamp(colsRaw, width, 20),
      rows: clamp(rowsRaw, height, 20),
    };

    return setCelView(out)
  }, [width, height, setCelView]);




  const handleResize = useCallback((e) => {
    calcVisible(windowRef.current);
  }, [windowRef, calcVisible]);


  useEffect(() => {
    console.log("added WINDOW event listener")
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [handleResize]);


  useEffect(() => {
    console.log("added SCROLL event listener")
    const el = windowRef.current;
    if (el) {
      el.addEventListener('scroll', handleResize, { passive: true });
    };
    return () => {
      if (el) {
        el.addEventListener('scroll', handleResize);
      };
    };
  }, [windowRef, handleResize]);


  const memoizedRows = useMemo(() => {
    console.log("memoizer ran")
    return cels.map((d, i) => <CelRow key={`row-${i}`} cels={d} />);
  }, [cels]);


  // useEffect(() => {
  //   console.log("memoization ran")
  //   const memoizedRows = cels.map((d, i) => <CelRow key={`row-${i}`} cels={d} />);
  //   setRows(memoizedRows);
  // }, [cels]);



  return memoizedRows;

  // console.log("memoizedRows", memoizedRows)

  // return (rows.length && celView.rows) ? rows.slice(...celView.rows) : [];

}









export default memo(function Grid({ data, cels, CelRender, gridRef, cursorMode, width, height, celScale } = {}) {

  const [drag, setDrag] = useState(false);
  const dragBoxRef = useRef(null);

  // const [celView, setCelView] = useState({});
console.log('grid data', data)

  // const rows = usePagination({
  //   cels,
  //   width,
  //   height,
  //   celScale,
  //   windowRef: dragBoxRef,
  // })


  // const calcVisible = useCallback((target) => {
  //   const {
  //     clientWidth,
  //     clientHeight,
  //     scrollWidth,
  //     scrollHeight,
  //     scrollLeft,
  //     scrollTop,
  //   } = target;
  //   const scalarX = scrollWidth / width;
  //   const scalarY = scrollHeight / height;
  //   const x = [scrollLeft, scrollLeft + clientWidth];
  //   const y = [scrollTop, scrollTop + clientHeight];

  //   const colsRaw = x.map(d => d / scalarX)
  //   const rowsRaw = y.map(d => d / scalarY)

  //   const out = {
  //     cols: clamp(colsRaw, width, 20),
  //     rows: clamp(rowsRaw, height, 20),
  //   };

  //   return setCelView(out)
  // }, [width, height, setCelView]);



  // const handleResize = useCallback((e) => {
  //   calcVisible(dragBoxRef.current);
  // }, [dragBoxRef, calcVisible]);

  // useEffect(() => {
  //   console.log("added event listener")
  //   window.addEventListener('resize', handleResize, { passive: true })
  //   return () => {
  //     window.removeEventListener('resize', handleResize)
  //   }
  // }, [handleResize]);



  // const handleScroll = useCallback((e) => {
  //   calcVisible(e.target);
  // }, [calcVisible]);





  const handleDragStart = useCallback(e => {
    if (cursorMode === 'paint') {
      return null;
    };
    setDrag(true);
  }, [cursorMode, setDrag]);


  const handleDragEnd = useCallback(e => {
    setDrag(false);
  }, [setDrag]);


  const handleDragMove = useCallback(e => {
    const el = dragBoxRef.current;
    el.scrollBy(-e.movementX, -e.movementY);
  }, [dragBoxRef]);


  useEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [drag, handleDragMove, handleDragEnd]);



  const celboxStyle = {
    gridTemplateColumns: `repeat(${width}, ${celScale}px)`,
    gridTemplateRows: `repeat(${height}, ${celScale}px)`,
    // gridAutoColumns: `${celScale}px`,
    // gridAutoRows: `${celScale}px`,
    gridGap: (celScale < 10) ? '0px' : '1px',
    cursor: cursorMode === 'paint'
      ? 'crosshair'
      : (drag ? 'grabbing, grab' : 'grab'),
  };

console.log("grid render")

  return (
    <div
      className="Grid--wrap"
      ref={dragBoxRef}
      onMouseDown={handleDragStart}
      // onScroll={handleScroll}
    >
      <div className="Grid--flex">
        <div
          className="Grid--celbox"
          ref={gridRef}
          style={celboxStyle}
        >
        </div>
      </div>
    </div>
  );
});

          // <CelRender {...celView} />


          // {rows}

          // <CelRender {...celView} />

