import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  // useRef,
  // useMemo,
  useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import './Map.css';
import {
  MapBlackout,
  MapButton,
  MapCanvas,
  MapOverlay,
  MapViewbox,
} from './';
import { cl, parse } from '../../libs';







// function useViewbox({
//   elRef,
//   elWindowRef,
//   viewboxRef,
// } = {}) {


//   const positionViewbox = useCallback(() => {
//     const el = elRef.current;
//     const elWindow = elWindowRef.current;
//     const viewbox = viewboxRef.current;
//     if (!elWindow || !el || !viewbox) {
//       return null;
//     };

//     const viewboxWidth = elWindow.clientWidth / el.clientHeight;
//     const viewboxHeight = elWindow.clientHeight / el.clientHeight;
//     const viewboxLeft = (elWindow.scrollLeft - el.offsetLeft) / el.clientWidth;
//     const viewboxTop = (elWindow.scrollTop - el.offsetTop) / el.clientHeight;

//     const { style } = viewbox;
//     style.left = parse.pct(viewboxLeft);
//     style.top = parse.pct(viewboxTop);
//     style.width = parse.pct(viewboxWidth);
//     style.height = parse.pct(viewboxHeight);
//   }, [elRef, elWindowRef, viewboxRef]);


//   useEffect(() => {   // redraw viewbox on change
//     const el = elWindowRef.current;
//     if (el) {
//       el.addEventListener('scroll', positionViewbox, { passive: true });
//       window.addEventListener('resize', positionViewbox, { passive: true });
//     };

//     return () => {
//       if (el) {
//         el.removeEventListener('scroll', positionViewbox);
//         window.removeEventListener('resize', positionViewbox);
//       };
//     };
//   }, [elWindowRef, positionViewbox]);


//   useEffect(() => {   // initial draw
//     if (elRef.current && elWindowRef.current && viewboxRef.current) {
//       positionViewbox();
//     };
//   }, [elRef, elWindowRef, viewboxRef, positionViewbox]);
// };







export default memo(function Map({
  mapCanvasRef = null,
  windowRef = null,
  touchRef = null,
  pan = null,
  uiMode = 0,
} = {}) {


  const [active, setActive] = useState(false);


  const showMap = useCallback(() => {
    if (active) return null;
    if (windowRef.current && touchRef.current) {
      setActive(true);
    };
  }, [windowRef, touchRef, active, setActive]);


  const hideMap = useCallback(e => {
    e.stopPropagation();
    setActive(false);
  }, [setActive]);


  const handlePan = useCallback((x, y) => {
    const {
      left,
      top,
      width,
      height,
    } = mapCanvasRef.current.getBoundingClientRect();
    const relX = (x - left) / width;
    const relY = (y - top) / height;
    pan(relX, relY);
  }, [mapCanvasRef, pan]);


  return (
    <div className="Map">
      <MapBlackout active={active} hideMap={hideMap} />
      <MapButton uiMode={uiMode} active={active} showMap={showMap}>
        <MapCanvas canvasRef={mapCanvasRef} />
        <MapOverlay uiMode={uiMode} active={active} pan={handlePan}>
          <MapViewbox elRef={touchRef} elWindowRef={windowRef} />
        </MapOverlay>
      </MapButton>
    </div>
  );
});



const MapPanner = memo(function MapPanner({
  active = false,
  children,
} = {}) {
  return (
      <div
        className={cl(
          'Map__map',
          [!active, 'Map__map--inactive']
        )}
      >
        {children}
      </div>
  );
});


        // <canvas className="Map__canvas" ref={mapCanvasRef} />


