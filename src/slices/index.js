import { combineReducers } from 'redux';
import operations, { actions as operationsActions } from './operations.js';
import toReceive, { actions as toReceiveActions } from './toReceive.js';
import toSend, { actions as toSendActions } from './toSend.js';
import text, { actions as textActions } from './text.js';

const actions = {
  ...operationsActions,
  ...toReceiveActions,
  ...textActions,
  ...toSendActions,
};

export { actions };

export default combineReducers({
  operations,
  toReceive,
  text,
  toSend,
});
