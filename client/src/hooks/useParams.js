import { useState, useEffect, useCallback } from 'react';





export default function useParams() {
  const [params, setParams] = useState(null);


  const getParams = useCallback(async () => {
    try {
      // const res = await fetch('/params');
      const res = await fetch('https://pxcels.herokuapp.com/params')
      const data = await res.json();
      setParams(data);
    } catch (err) {
      console.error('Unable to fetch params ---', err);
      return null;
    };
  }, [setParams]);


  useEffect(() => {
    if (!params) {
      getParams();
    };
  }, [params, getParams]);


  return params;
};
