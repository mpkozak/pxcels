import {
  useRef,
  useState,
  useEffect,
  useCallback,
  // useGlobalContext,
} from 'react';
import {
  useParams,
  // useSocket,
  useViewportScalar,
  useGlobalContext,
} from './';





export default function useInit() {
  const [state, dispatch] = useGlobalContext();
  const {
    width,
    height,
    colors,
    scalar,
    scaleRange,
    scaleInitial,
  } = state;


  useParams(dispatch);

  useViewportScalar({ width, height, scalar, dispatch });

  // console.log(state)


  // const {
  //   width,
  //   height,
  //   colors = [],
  // } = useParams(setState) || {};



  // const {
  //   // scalar,
  //   scaleRange,
  //   scaleInitial,
  // } = useViewportScalar({ width, height });


  // const {
  //   socketActive,
  //   username,
  //   addListener,
  //   postMessage,
  // } = useSocket();
  if (!scaleInitial) {
    console.log('init not ready')
    return {};
  }

  return {
    width,
    height,
    colors,
    scalar,
    scaleRange,
    scaleInitial,
    // socketActive,
    // username,
    // addListener,
    // postMessage,
  };
};
