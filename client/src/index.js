import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();



// window.addEventListener('touchmove', e => e.preventDefault())


window.addEventListener('touchstart', cancelTouch);
window.addEventListener('touchmove', cancelTouch);



function cancelTouch(e) {
  console.log(e)
  // e.preventDefault();
  // e.stopPropagation();
}
