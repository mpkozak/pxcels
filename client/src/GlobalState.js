import React, { createContext, useReducer, useContext } from 'react';





const initialState = {
  width: 0,
  height: 0,
  colors: [],
  uuid: localStorage.getItem('uuid'),
  username: localStorage.getItem('username'),
    scalar: (window.devicePixelRatio * 4),
    viewportMinGridScale: .5,
    viewportMaxCelPx: 100,
  scaleRange: [],


  uiMode: 0,
  cursorMode: 'drag',
  activeColor: 6,


  hidMode: 0,
};



function globalStateReducer(state, action) {
  const { msg, data } = action;
  // console.log("SETTING STATE ---", msg, data)

  switch (msg) {
    case 'params':
      const { width, height, colors } = data;
      return ({ ...state, width, height, colors });
    case 'login':
      const { uuid, name } = data;
      localStorage.setItem('uuid', uuid);
      localStorage.setItem('username', name);
      return ({ ...state, uuid, username: name });
    case 'scaleRange':
      return ({ ...state, scaleRange: data });
    default:
      return state;
  };
};


const GlobalStateContext = createContext();


function GlobalStateProvider({ children } = {}) {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  return (
    <GlobalStateContext.Provider value={[state, dispatch]}>
      {children}
    </GlobalStateContext.Provider>
  );
};





function useGlobalState() {
  const [state, dispatch] = useContext(GlobalStateContext);
  const setState = (msg, data) => dispatch({ msg, data });

  return [state, setState];
};





export {
  GlobalStateProvider as default,
  useGlobalState,
};
