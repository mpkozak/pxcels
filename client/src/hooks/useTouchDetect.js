import { useState, useEffect, useCallback } from 'react';





export default function useTouchDetect() {
  // const [touch, setTouch] = useState(localStorage.getItem('touch_device') || false);
  // const [mouse, setMouse] = useState(localStorage.getItem('mouse_device') || false);
  const [touch, setTouch] = useState(false);
  const [mouse, setMouse] = useState(false);

  const handleTouch = useCallback(e => {
    setTouch(true);
    localStorage.setItem('touch_device', true);
  }, [setTouch]);

  const handleMouse = useCallback(e => {
    setMouse(true);
    localStorage.setItem('mouse_device', true);
  }, [setMouse]);


  useEffect(() => {
    console.log("effect ran")
    if (!touch && !mouse) {
      document.addEventListener('mousedown', handleMouse);
      document.addEventListener('touchstart', handleTouch);
    };
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('touchstart', handleTouch);
    }
  }, [touch, mouse, handleTouch, handleMouse]);


  return {
    ready: mouse || touch,
    hasTouch: touch,
    hasMouse: mouse,
  };
};

