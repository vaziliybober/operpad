import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

const select = createSelector(
  ({ channels, messages }) => ({
    currentChannelId: channels.currentId,
    messages,
  }),

  ({ currentChannelId, messages }) =>
    messages.allIds
      .map((id) => messages.byId[id])
      .filter((m) => m.channelId === currentChannelId),
);

export default () => {
  const messages = useSelector(select);

  return [messages];
};
