import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
// import GlobalContextProvider from './GlobalContext.js';





ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


// ReactDOM.render(
//   <React.StrictMode>
//     <GlobalContextProvider>
//       <App />
//     </GlobalContextProvider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
