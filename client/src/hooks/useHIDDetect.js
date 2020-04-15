import { useState, useEffect, useCallback } from 'react';





export default function useHIDDetect(ref) {
  // const [touch, setTouch] = useState(localStorage.getItem('touch_device') || false);
  // const [mouse, setMouse] = useState(localStorage.getItem('mouse_device') || false);
  const [touch, setTouch] = useState(false);
  const [mouse, setMouse] = useState(false);


  const handleTouch = useCallback(e => {
    e.preventDefault();
    setTouch(true);
    localStorage.setItem('touch_device', true);
  }, [setTouch]);

  const handleMouse = useCallback(e => {
    e.preventDefault();
    setMouse(true);
    localStorage.setItem('mouse_device', true);
  }, [setMouse]);


  useEffect(() => {
    const handleClick = e => e.preventDefault();
    const el = ref.current;
    if (!touch && !mouse) {
      el.addEventListener('mousedown', handleMouse);
      el.addEventListener('touchstart', handleTouch);
      el.addEventListener('click', handleClick)
    };
    return () => {
      if (el) {
        el.removeEventListener('mousedown', handleMouse);
        el.removeEventListener('touchstart', handleTouch);
        el.removeEventListener('click', handleClick);
      };
    }
  }, [ref, touch, mouse, handleTouch, handleMouse]);


  return {
    hidStatus: +(mouse || touch),
    hasTouch: touch,
    hasMouse: mouse,
  };
};

