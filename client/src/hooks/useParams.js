import {
  useEffect,
  useCallback,
} from 'react';





export default function useParams(dispatch) {

    console.log('useParams ran')

  const fetchParams = useCallback(async () => {
    console.log('fetchparams ran')
    try {
      const url = `${process.env.REACT_APP_API_URL || ''}/params`;
      const res = await fetch(url)
      const data = await res.json();
      dispatch('params', {
        width: +data.width,
        height: +data.height,
        colors: data.colors,
      });
    } catch (err) {
      console.error('Unable to fetch params ---', err);
      return null;
    };
  }, [dispatch]);


  useEffect(() => {
    fetchParams();
  }, [fetchParams]);


  return true;
};
