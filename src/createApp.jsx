import 'regenerator-runtime/runtime';

import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import App from './components/App.jsx';
import reducer from './slices/index.js';

export default () => {
  const store = configureStore({
    reducer,
    preloadedState: {
      operations: {
        awaited: [],
        buffer: [],
      },
    },
  });

  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};
