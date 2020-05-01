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
