import {
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { parse } from '../libs';





export default function useMapViewbox({
  elRef,
  elWindowRef,
} = {}) {


  const viewboxRef = useRef(null);


  const positionViewbox = useCallback(() => {
    const el = elRef.current;
    const elWindow = elWindowRef.current;
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
  }, [elRef, elWindowRef, viewboxRef]);


  useEffect(() => {   // redraw viewbox on change
    const el = elWindowRef.current;
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
  }, [elWindowRef, positionViewbox]);


  useEffect(() => {   // initial draw
    if (elRef.current && elWindowRef.current && viewboxRef.current) {
      positionViewbox();
    };
  }, [elRef, elWindowRef, viewboxRef, positionViewbox]);


  return viewboxRef;
};
