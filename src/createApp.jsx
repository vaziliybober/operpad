import 'regenerator-runtime/runtime';
import React from 'react';
import gon from 'gon';
import App from './components/App.jsx';

export default () => (
  <App
    clientId={gon.clientId}
    initialText={gon.text}
    initialRevisionIndex={gon.revisionIndex}
  />
);
