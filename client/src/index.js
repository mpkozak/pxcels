import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
// import * as serviceWorker from './serviceWorker';





const isMobile = (() => {
  const uaMatch = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i);
  const screenMatch = window.matchMedia('only screen and (max-width: 760px)').matches;
  if (uaMatch || screenMatch) {
    return true;
  };
  return false;
})();





ReactDOM.render(
  <React.StrictMode>
    <App mobile={isMobile} />
  </React.StrictMode>,
  document.getElementById('root')
);





// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
