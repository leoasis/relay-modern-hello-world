import React from 'react';
import ReactDOM from 'react-dom';
import AppRelay from './Relay/App';
import AppApollo from './Apollo/App';
import './index.css';

ReactDOM.render(
  <div>
    <AppRelay />
    <AppApollo />
  </div>,
  document.getElementById('root')
);
