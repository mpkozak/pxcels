import React, {
  memo,
  useMemo,
} from 'react';





export default memo(function GridLines({
  width = 0,
  height = 0,
  pxWidth,
  pxHeight,
  gridRatio = 1,
} = {}) {


  const viewBox = useMemo(() => `0 0 ${width} ${height}`, [width, height]);


  const lines = useMemo(() => {
    const cols = (new Array(1 + width).fill('')).map((d, i) =>
      <path key={`x${i}`} d={`M ${i} ${height} L ${i} 0`} />
    );
    const rows = (new Array(1 + height).fill('')).map((d, i) =>
      <path key={`y${i}`} d={`M 0 ${i} L ${width} ${i}`} />
    );
    return [...cols, ...rows];
  }, [width, height]);


  const strokeWidth = useMemo(() => {
    const sw = (1 / gridRatio);
    if (isNaN(sw) || sw > 1) {
      return 0;
    };
    return sw;
  }, [gridRatio]);


  const opacity = useMemo(() => {
    return Math.max((1 - strokeWidth) * 2 - 1, 0).toFixed(2);
  }, [strokeWidth]);


  if (!strokeWidth) return null;


  return (
    <svg
      className="Grid__lines"
      width={pxWidth}
      height={pxHeight}
      viewBox={viewBox}
    >
      <g
        className="Grid__line-group"
        strokeWidth={strokeWidth}
        opacity={opacity}
      >
        {lines}
      </g>
    </svg>
  );
});
