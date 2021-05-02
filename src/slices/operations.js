/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';
import Operation from '../../lib/operation.js';

const slice = createSlice({
  name: 'operations',
  initialState: {
    awaited: new Operation().toJSON(),
    buffer: new Operation().toJSON(),
    syncedAt: 0,
  },
  reducers: {
    setAwaitedOperation: (state, { payload }) => {
      const { operation } = payload;
      state.awaited = operation;
    },
    addBufferOperation: (state, { payload }) => {
      const { operation } = payload;
      state.buffer = Operation.fromJSON(state.buffer)
        .concat(Operation.fromJSON(operation))
        .toJSON();
    },
    aknowledgeOwnOperation: (state, { payload }) => {
      const { revisionIndex } = payload;
      return {
        awaited: state.buffer,
        buffer: new Operation().toJSON(),
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
