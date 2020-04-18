import React, {
  // Fragment,
  // createContext,
  memo,
  // useContext,
  useRef,
  // useMemo,
  useState,
  // useReducer,
  useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';
import './Minimap.css';
import { cl, parse } from '../../libs';





export default memo(function Minimap({
  mapCanvasRef = null,
  windowRef = null,
  touchRef = null,
  pan = null,
  uiMode = 0,
} = {}) {

  const [bigMap, setBigMap] = useState(false);
  const [panning, setPanning] = useState(false);
  const viewboxRef = useRef(null);


  const activateMap = useCallback(() => {
    if (bigMap) {
      return null;
    };
    if (windowRef.current && touchRef.current) {
      setBigMap(true);
    };
  }, [windowRef, touchRef, bigMap, setBigMap]);

  const disableMap = useCallback(e => {
    e.stopPropagation();
    setBigMap(false);
    setPanning(false);
  }, [setBigMap, setPanning]);


  const disablePanning = useCallback(e => {
    setPanning(false);
  }, [setPanning]);


  const positionViewbox = useCallback(() => {
    const elWindow = windowRef.current;
    const elGrid = touchRef.current;
    const elViewer = viewboxRef.current;
    if (!elWindow || !elGrid || !elViewer) {
      return null;
    };

    const viewboxWidth = elWindow.clientWidth / elGrid.clientHeight;
    const viewboxHeight = elWindow.clientHeight / elGrid.clientHeight;
    const viewboxLeft = (elWindow.scrollLeft - elGrid.offsetLeft) / elGrid.clientWidth;
    const viewboxTop = (elWindow.scrollTop - elGrid.offsetTop) / elGrid.clientHeight;

    const { style } = elViewer;
    style.left = parse.pct(viewboxLeft);
    style.top = parse.pct(viewboxTop);
    style.width = parse.pct(viewboxWidth);
    style.height = parse.pct(viewboxHeight);
  }, [windowRef, touchRef, viewboxRef]);


  useEffect(() => {   // redraw viewbox
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


  const handleMouseMove = useCallback(e => {
    const { clientX, clientY } = e;
    handlePan(clientX, clientY);
  }, [handlePan]);

  const handleTouchMove = useCallback(e => {
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    handlePan(clientX, clientY);
  }, [handlePan]);


  const handleMouseDown = useCallback(e => {
    setPanning(true);
    const { clientX, clientY } = e;
    handlePan(clientX, clientY);
  }, [setPanning, handlePan]);

  const handleTouchStart = useCallback(e => {
    setPanning(true);
    const { targetTouches } = e;
    const { clientX, clientY } = targetTouches[0];
    handlePan(clientX, clientY);
  }, [setPanning, handlePan]);


  useEffect(() => {
    if (panning) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', disablePanning);
      window.addEventListener('touchcancel', disablePanning);
      window.addEventListener('touchend', disablePanning);
    };
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', disablePanning);
      window.removeEventListener('touchcancel', disablePanning);
      window.removeEventListener('touchend', disablePanning);
    };
  }, [panning, handleMouseMove, disablePanning]);


  return (
    <div className="Minimap">
      <div className={cl('Minimap--interceptor', [bigMap, 'active'])}
        onClick={disableMap}
      />
      <div
        className={cl(
          'Minimap--toggle',
          'button',
          'button--big',
          [uiMode === 2, 'Minimap--toggle__mouse'],
          [!bigMap, 'small'],
        )}
        onClick={activateMap}
      >
        <div className={cl('Minimap--map', [!bigMap, 'small'])}>
          <canvas className="Minimap--map-layer Minimap--canvas"
            ref={mapCanvasRef}
          />
          <div className="Minimap--map-layer Minimap--overlay"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onMouseDown={handleMouseDown}
          >
            <div className="Minimap--overlay-viewbox" ref={viewboxRef} />
          </div>
        </div>
      </div>
    </div>
  );
});
