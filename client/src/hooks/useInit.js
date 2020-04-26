import { useParams, useSocket, useViewportScalar } from './';





export default function useInit() {
  const {
    width,
    height,
    colors = [],
  } = useParams() || {};


  const {
    scalar,
    scaleRange,
    scaleInitial,
  } = useViewportScalar({ width, height });


  const {
    socketActive,
    username,
    addListener,
    postMessage,
  } = useSocket();


  return {
    width,
    height,
    colors,
    scalar,
    scaleRange,
    scaleInitial,
    socketActive,
    username,
    addListener,
    postMessage,
  };
};
