import {
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useGlobalState } from './';





export default function useParams() {
  // console.log('useParams ran')

  const [state, setState] = useGlobalState();
  const activeReq = useRef(false);


  const parseAndSetParams = useCallback((data) => {
    setState('params', {
      width: +data.width,
      height: +data.height,
      colors: data.colors,
    });
  }, [setState]);


  const fetchParams = useCallback(async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL || ''}/params`;
      const res = await fetch(url)
      const data = await res.json();
      parseAndSetParams(data);
    } catch (err) {
      console.error('Unable to fetch params ---', err);
      return null;
    } finally {
      activeReq.current = false;
    };
  }, [parseAndSetParams, activeReq]);


  useEffect(() => {
    if (!state.width && !activeReq.current) {
      activeReq.current = true;
      fetchParams();
    };
  }, [state, fetchParams]);


  return null;
};
