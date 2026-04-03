import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

window.onerror = function(message) {
  if (message?.includes('EmptyRanges')) {
    return true; // suppresses the playback expired error
  }
};

window.addEventListener('error', (e) => {
  if (e.message?.includes('EmptyRanges')) {
    e.stopImmediatePropagation(); //more supressing
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
