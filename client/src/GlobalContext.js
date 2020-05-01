import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';





const initialState = {
    width: 0,
    height: 0,
    colors: [],
    scalar: 0,
    scaleRange: [],
    scaleInitial: 0,
    uiMode: 0,      // 0 = unknown; 1 = touch; 2 = mouse;
};



function globalContextReducer(state, action) {
  const { msg, data } = action;
  // console.log("SETTING GLOBAL CONTEXT ---", msg, data)

  switch (msg) {
    case 'params':
      const { width, height, colors } = data;
      return ({ ...state, width, height, colors });
    case 'scale':
      const { scalar, scaleRange, scaleInitial } = data;
      return ({ ...state, scalar, scaleRange, scaleInitial });
    case 'uiMode':
      const cursorMode = data === 2 ? 0 : 1;
      return ({ ...state, uiMode: data, cursorMode });
    default:
      if (msg in state) {
        return ({ ...state, [msg]: data });
      };
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
