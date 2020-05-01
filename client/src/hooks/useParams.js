import { useEffect, useCallback } from 'react';
import { useGlobalContext } from './';





export default function useParams() {
  const [context, dispatch] = useGlobalContext();
  const { width } = context;


  const fetchParams = useCallback(async () => {
    // console.log('useParams -- fetchParams')
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
    // console.log('useParams -- EFFECT')
    if (!width) {
      // console.log('useParams -- EFFECT RAN')
      fetchParams();
    };
  }, [width, fetchParams]);
};







// import {
//   useEffect,
//   useCallback,
// } from 'react';





// export default function useParams(dispatch) {
//   // console.log('useParams ran')


//   const fetchParams = useCallback(async () => {
//     console.log('useParams -- fetchParams')
//     try {
//       const url = `${process.env.REACT_APP_API_URL || ''}/params`;
//       const res = await fetch(url)
//       const data = await res.json();
//       dispatch('params', {
//         width: +data.width,
//         height: +data.height,
//         colors: data.colors,
//       });
//     } catch (err) {
//       console.error('Unable to fetch params ---', err);
//       return null;
//     };
//   }, [dispatch]);


//   useEffect(() => {
//     console.log('useParams -- EFFECT')
//     fetchParams();
//   }, [fetchParams]);


//   return true;
// };
