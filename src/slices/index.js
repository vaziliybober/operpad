import { combineReducers } from 'redux';
import channels, { actions as channelsActions } from './channels.js';
import messages, { actions as messagesActions } from './messages.js';

const actions = {
  ...channelsActions,
  ...messagesActions,
};

export { actions };

export default combineReducers({
  channels,
  messages,
});
