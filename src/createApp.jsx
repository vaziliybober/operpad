import 'regenerator-runtime/runtime';

import gon from 'gon';
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import Cookies from 'js-cookie';
import Rollbar from 'rollbar';
import faker from 'faker';
import { io } from 'socket.io-client';
import App from './components/App.jsx';
import { UserNameProvider } from './contexts/UserNameContext.jsx';
import reducer, { actions } from './slices/index.js';

const buildStore = () => {
  if (!gon) {
    return configureStore({ reducer });
  }
  const generalChannelId = gon.channels[0].id;

  return configureStore({
    reducer,
    preloadedState: {
      channels: {
        byId: Object.fromEntries(gon.channels.map((ch) => [ch.id, ch])),
        allIds: gon.channels.map((ch) => ch.id),
        defaultId: generalChannelId,
        currentId: generalChannelId,
      },
      messages: {
        byId: Object.fromEntries(gon.messages.map((m) => [m.id, m])),
        allIds: gon.messages.map((m) => m.id),
      },
    },
  });
};

export default () => {
  if (process.env.NODE_ENV === 'production') {
    /* eslint-disable no-new */
    new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: process.env.NODE_ENV,
      },
    });
    /* eslint-enable no-new */
  } else {
    localStorage.debug = 'chat:*';
  }

  const store = buildStore();

  const socket = io();
  socket.on('newMessage', (data) => {
    const message = data.data.attributes;
    store.dispatch(actions.addMessage({ message }));
  });
  socket.on('newChannel', (data) => {
    const channel = data.data.attributes;
    store.dispatch(actions.addChannel({ channel }));
  });
  socket.on('removeChannel', (data) => {
    const { id } = data.data;
    store.dispatch(actions.removeChannel({ id }));
  });
  socket.on('renameChannel', (data) => {
    const channel = data.data.attributes;
    store.dispatch(actions.renameChannel({ channel }));
  });

  // I think this part is imperative by nature
  /* eslint-disable functional/no-let */
  let { userName } = Cookies.get();
  if (!userName) {
    userName = faker.name.findName();
    Cookies.set('userName', userName);
  }
  /* eslint-enable functional/no-let */

  return (
    <Provider store={store}>
      <UserNameProvider value={userName}>
        <App />
      </UserNameProvider>
    </Provider>
  );
};
