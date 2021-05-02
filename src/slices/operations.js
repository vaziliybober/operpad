/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'operations',
  initialState: {
    awaited: [],
    buffer: [],
    syncedAt: 0,
  },
  reducers: {
    addUserOperation: (state, { payload }) => {
      const { awaited, buffer } = state;
      const { operation } = payload;
      if (awaited.length === 0) {
        awaited.push(...operation);
      } else {
        buffer.push(...operation);
      }
    },
    aknowledgeOwnOperation: (state, { payload }) => {
      const { buffer } = state;
      const { revisionIndex } = payload;
      return {
        awaited: [...buffer],
        buffer: [],
        syncedAt: revisionIndex,
      };
    },
    transformAwaited: (state, { payload }) => {
      const { buffer, syncedAt } = state;
      const { transformedAwaited } = payload;
      return {
        awaited: transformedAwaited,
        buffer,
        syncedAt,
      };
    },
    transformBuffer: (state, { payload }) => {
      const { awaited, syncedAt } = state;
      const { transformedBuffer } = payload;
      return {
        awaited,
        buffer: transformedBuffer,
        syncedAt,
      };
    },
  },
});

export const { actions } = slice;
export default slice.reducer;
