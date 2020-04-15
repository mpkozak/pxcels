import React, { Fragment, memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import { d3, parse } from '../libs';
// import { useSocket } from './';






export default function useViewport({ props } = {}) {
console.log( 'useviewport', window.screen.availWidth, window.innerWidth)

// function quarter() {
//   window.resizeTo(
//     window.screen.availWidth / 2,
//     window.screen.availHeight / 2
//   );
// }
//   window.resizeBy(20, 20)
//   quarter();






  const handleResize = useCallback((e) => {
    const { innerWidth, innerHeight } = window;
    const minDimen = Math.min(innerWidth, innerHeight);

    console.log("minD", minDimen);

    console.log('resize', e)
  }, [])



  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);



  // useEffect(() => {
  //   const { innerWidth, innerHeight } = window;
  //   console.log("inn", innerWidth, innerHeight)
  //   // window.resizeTo(20, 500),
  // }, [])





  // useEffect(() => {

  // }, [])

  // useCallback(() => {

  // }, [])



};
