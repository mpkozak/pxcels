import React, { memo, useMemo } from 'react';





export default memo(function GridLines({ width = 0, height = 0, pxWidth, pxHeight } = {}) {
  const cols = useMemo(() => {
    return (new Array(1 + width).fill('')).map((d, i) =>
      <path key={`x${i}`} d={`M ${i} ${height} L ${i} 0`} />
    );
  }, [width, height]);

  const rows = useMemo(() => {
    return (new Array(1 + height).fill('')).map((d, i) =>
      <path key={`y${i}`} d={`M 0 ${i} L ${width} ${i}`} />
    );
  }, [width, height]);

  const strokeWidth = useMemo(() => {
    const sw = (width / pxWidth);
    if (isNaN(sw) || sw > .1) {
      return 0;
    };
    return sw;
  }, [width, pxWidth]);


  if (!strokeWidth) return null;

  return (
    <svg
      className="Grid--lines"
      width={pxWidth}
      height={pxHeight}
      viewBox={`0 0 ${width} ${height}`}
    >
      <g strokeWidth={strokeWidth}>
        {rows}
        {cols}
      </g>
    </svg>
  );
});
