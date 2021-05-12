import 'regenerator-runtime/runtime';
import React from 'react';
import gon from 'gon';
import App from './components/App.jsx';

export default () => {
  console.log(gon.clientId);
  return (
    <App
      clientId={gon.clientId}
      documentId={gon.documentId}
      initialText={gon.text}
      initialRevisionIndex={gon.revisionIndex}
      mode={gon.documentId === 'demo' ? 'demo' : 'default'}
    />
  );
};
