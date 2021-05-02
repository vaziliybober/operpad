/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'toSend',
  initialState: {},
  reducers: {
    sendOperation: (state, { payload }) => {
      const { data } = payload;
      return data;
    },
    clearSentOperation: () => ({}),
  },
});

export const { actions } = slice;
export default slice.reducer;
