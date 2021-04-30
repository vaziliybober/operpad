/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'operations',
  initialState: {
    awaited: [],
    buffer: [],
  },
  reducers: {
    addUserOperations: (state, { payload }) => {
      const { awaited, buffer } = state;
      const { operations } = payload;
      if (awaited.length === 0) {
        awaited.push(...operations);
      } else {
        buffer.push(...operations);
      }
    },
  },
});

export const { actions } = slice;
export default slice.reducer;
