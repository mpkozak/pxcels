import { useState, useEffect, useCallback } from 'react';





export default function useParams() {
  const [params, setParams] = useState(null);


  const parseAndSetParams = useCallback((data) => {
    setParams({
      width: +data.width,
      height: +data.height,
      colors: data.colors,
    });
  }, [setParams]);


  const fetchParams = useCallback(async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL || ''}/params`;
      const res = await fetch(url)
      const data = await res.json();
      parseAndSetParams(data);
    } catch (err) {
      console.error('Unable to fetch params ---', err);
      return null;
    };
  }, [parseAndSetParams]);


  useEffect(() => {
    if (!params) {
      fetchParams();
    };
  }, [params, fetchParams]);


  return params || {};
};
