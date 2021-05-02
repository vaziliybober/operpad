/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'text',
  initialState: '',
  reducers: {
    setText: (state, { payload }) => {
      const { text } = payload;
      return text;
    },
  },
});

export const { actions } = slice;
export default slice.reducer;
