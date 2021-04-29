/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import { actions as channelsActions } from './channels.js';

const slice = createSlice({
  name: 'messages',
  initialState: { byId: [], allIds: [] },
  reducers: {
    addMessage: (state, { payload }) => {
      const { message } = payload;
      state.byId[message.id] = message;
      state.allIds.push(message.id);
    },
  },
  extraReducers: {
    [channelsActions.removeChannel]: (state, { payload }) => {
      const { id: channelId } = payload;
      state.allIds = state.allIds.filter(
        (id) => state.byId[id].channelId !== channelId,
      );
      state.byId = _.omitBy(state.byId, (m) => m.channelId === channelId);
    },
  },
});

export const { actions } = slice;
export default slice.reducer;
