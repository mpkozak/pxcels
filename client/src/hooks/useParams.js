import { useState, useEffect, useCallback } from 'react';





export default function useParams() {
  const [params, setParams] = useState(null);


  const parseParams = useCallback((data) => {
    setParams({
      width: +data.width,
      height: +data.height,
      colors: data.colors,
    });
  }, [setParams]);


  const getParams = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/params`)
      const data = await res.json();
      parseParams(data);
    } catch (err) {
      console.error('Unable to fetch params ---', err);
      return null;
    };
  }, [parseParams]);


  useEffect(() => {
    if (!params) {
      getParams();
    };
  }, [params, getParams]);


  return params;
};
