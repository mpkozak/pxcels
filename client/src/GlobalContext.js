import React, {
  // Fragment,
  createContext,
  // memo,
  useContext,
  // useRef,
  // useMemo,
  // useState,
  useReducer,
  // useEffect,
  // useLayoutEffect,
  useCallback,
} from 'react';





const initialState = {
    width: 0,
    height: 0,
    colors: [],
    scalar: (window.devicePixelRatio * 4),
    scaleRange: [],
    scaleInitial: 0,
    uiMode: 0,
    cursorMode: 0,      // 0 = drag; 1 = paint;
    activeColor: localStorage.getItem('color') || 6,
};



function globalContextReducer(state, action) {
  const { msg, data } = action;
  console.log("SETTING GLOBAL CONTEXT ---", msg, data)

  switch (msg) {
    case 'params':
      const { width, height, colors } = data;
      return ({ ...state, width, height, colors });
    // case 'login':
    //   const { uuid, name } = data;
    //   localStorage.setItem('uuid', uuid);
    //   localStorage.setItem('username', name);
    //   return ({ ...state, uuid, username: name });
    case 'scale':
      const { scaleRange, scaleInitial } = data;
      return ({ ...state, scaleRange, scaleInitial });


    case 'uiMode':
      localStorage.setItem('uiMode', data);
      return ({ ...state, uiMode: data });
    case 'cursorMode':
      return ({ ...state, cursorMode: data });
    case 'activeColor':
      localStorage.setItem('color', data);
      return ({ ...state, activeColor: data });
    default:
      return state;
  };
};


const GlobalContext = createContext();


function GlobalContextProvider({ children } = {}) {
  const [state, dispatch] = useReducer(globalContextReducer, initialState);

  return (
    <GlobalContext.Provider value={[state, dispatch]}>
      {children}
    </GlobalContext.Provider>
  );
};





function useGlobalContext() {
  const [state, dispatch] = useContext(GlobalContext);
  const setState = useCallback((msg, data) => dispatch({ msg, data }), [dispatch]);

  return [state, setState];
};





export {
  GlobalContextProvider as default,
  useGlobalContext,
};
