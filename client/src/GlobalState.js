import React, { createContext, useReducer, useContext } from 'react';





const initialState = {
  width: 0,
  height: 0,
  colors: [],
  hidMode: 0,

    // 'mouse' = 0; 'touch' - 1;

};


function updateState(state, key, val) {

  switch (key) {
    case 'params':
      const newState = Object.assign(state, ...val);
      return newState;
    default:
      break;
  };

  // console.log('update state', state, key, val)

  // return key in initialState
  //   ? ({ ...state, [key]: val })
  //   : state;
};


function globalStateReducer(state, action) {
  return updateState(state, action.stateKey, action.newVal);
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
  const setState = ([stateKey, newVal]) => dispatch({ stateKey, newVal });

  return { state, setState };
};





export {
  GlobalStateProvider as default,
  useGlobalState,
};
