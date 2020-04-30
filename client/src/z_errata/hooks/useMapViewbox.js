import { useRef, useEffect, useCallback } from 'react';
import { parse } from '../libs';





export default function useMapViewbox({
  gridRef = null,
  windowRef = null,
  zoom,
} = {}) {


  const prevZoom = useRef(zoom);
  const viewboxRef = useRef(null);


  const positionViewbox = useCallback(() => {
    const el = gridRef.current;
    const elWindow = windowRef.current;
    const viewbox = viewboxRef.current;
    if (!el || !elWindow || !viewbox) return null;

    const left = (elWindow.scrollLeft - el.offsetLeft) / el.clientWidth;
    const top = (elWindow.scrollTop - el.offsetTop) / el.clientHeight;
    const width = elWindow.clientWidth / el.clientHeight;
    const height = elWindow.clientHeight / el.clientHeight;

    const { style } = viewbox;
    style.left = parse.pct(left);
    style.top = parse.pct(top);
    style.width = parse.pct(width);
    style.height = parse.pct(height);
  }, [gridRef, windowRef, viewboxRef]);


  useEffect(() => {   // redraw viewbox on scroll/resize
    const el = windowRef.current;
    if (el) {
      el.addEventListener('scroll', positionViewbox, { passive: true });
      window.addEventListener('resize', positionViewbox, { passive: true });
    };

    return () => {
      if (el) {
        el.removeEventListener('scroll', positionViewbox);
        window.removeEventListener('resize', positionViewbox);
      };
    };
  }, [windowRef, positionViewbox]);


  useEffect(() => {   // redraw viewbox on zoom
    const prev = prevZoom.current;
    if (prev !== zoom) {
      prevZoom.current = zoom;
      positionViewbox();
    };
  }, [prevZoom, zoom, positionViewbox]);


  useEffect(() => {   // initial draw
    if (gridRef.current && windowRef.current && viewboxRef.current) {
      positionViewbox();
    };
  }, [gridRef, windowRef, viewboxRef, positionViewbox]);


  return viewboxRef;
};
