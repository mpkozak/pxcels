import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import GlobalContextProvider from './GlobalContext.js';
import App from './App.jsx';





// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );


ReactDOM.render(
  <React.StrictMode>
    <GlobalContextProvider>
      <App />
    </GlobalContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
