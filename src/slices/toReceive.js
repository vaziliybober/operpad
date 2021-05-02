/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'toReceive',
  initialState: [],
  reducers: {
    receiveOperation: (state, { payload }) => {
      const { data } = payload;
      state.push(data);
    },
    clearReceivedOperation: (state) => {
      state.shift();
    },
  },
});

export const { actions } = slice;
export default slice.reducer;
