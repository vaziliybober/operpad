import { combineReducers } from 'redux';
import operations, { actions as operationsActions } from './operations.js';

const actions = {
  ...operationsActions,
};

export { actions };

export default combineReducers({
  operations,
});
