import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

import { actions } from '../slices/index.js';

const channelsSelector = createSelector(
  (state) => state.channels,
  (channels) => channels.allIds.map((id) => channels.byId[id]),
);

const defaultChannelIdSelector = createSelector(
  (state) => state.channels,
  (channels) => channels.defaultId,
);

const currentChannelIdSelector = createSelector(
  (state) => state.channels,
  (channels) => channels.currentId,
);

export default () => {
  const dispatch = useDispatch();
  const channels = useSelector(channelsSelector);
  const defaultChannelId = useSelector(defaultChannelIdSelector);
  const currentChannelId = useSelector(currentChannelIdSelector);

  return [
    {
      channels,
      defaultChannelId,
      currentChannelId,
    },
    {
      setCurrentChannelId: (id) =>
        dispatch(actions.setCurrentChannelId({ id })),
    },
  ];
};
