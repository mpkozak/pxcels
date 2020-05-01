import React, { memo, useState, useCallback } from 'react';
import './Map.css';
import { useGlobalContext, useMapViewbox } from '../../hooks';
import {
  MapBlackout,
  MapButton,
  MapCanvas,
  MapOverlay,
  MapViewbox,
} from './';





export default memo(function Map({
  gridRef = null,
  windowRef = null,
  mapCanvasRef = null,
  zoom = 1,
  panWindow = null,
} = {}) {


  const [context] = useGlobalContext();
  const { uiMode } = context;


  const viewboxRef = useMapViewbox({ gridRef, windowRef, zoom });


  const [active, setActive] = useState(false);


  const showMap = useCallback(() => {
    if (active) return null;
    if (windowRef.current && gridRef.current) {
      setActive(true);
    };
  }, [windowRef, gridRef, active, setActive]);


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
    panWindow(relX, relY);
  }, [mapCanvasRef, panWindow]);


  return (
    <div className="Map">
      <MapBlackout active={active} hideMap={hideMap} />
      <MapButton uiMode={uiMode} active={active} showMap={showMap}>
        <MapCanvas canvasRef={mapCanvasRef} />
        <MapOverlay uiMode={uiMode} active={active} pan={handlePan}>
          <MapViewbox viewboxRef={viewboxRef} />
        </MapOverlay>
      </MapButton>
    </div>
  );
});
