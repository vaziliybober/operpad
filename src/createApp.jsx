import 'regenerator-runtime/runtime';

import gon from 'gon';
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { io } from 'socket.io-client';
import App from './components/App.jsx';
import reducer, { actions } from './slices/index.js';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { UserIdProvider } from './contexts/UserIdContext.jsx';

const buildStore = () => {
  if (!gon) {
    return configureStore({ reducer });
  }

  return configureStore({
    reducer,
    preloadedState: {
      operations: {
        awaited: [],
        buffer: [],
        syncedAt: gon.syncedAt,
      },
      toReceive: [],
    },
  });
};

export default () => {
  const store = buildStore();

  const socket = io();

  socket.on('operation', (data) => {
    store.dispatch(actions.receiveOperation({ data }));
  });

  console.log('userId: ', gon.userId);

  return (
    <Provider store={store}>
      <UserIdProvider value={gon.userId}>
        <SocketProvider value={socket}>
          <App text={gon.text} />
        </SocketProvider>
      </UserIdProvider>
    </Provider>
  );
};
