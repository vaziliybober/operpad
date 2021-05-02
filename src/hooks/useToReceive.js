import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../slices/index.js';

export default () => {
  const dispatch = useDispatch();
  const toReceive = useSelector((state) => state.toReceive);

  return [
    toReceive,
    {
      receiveOperation: (data) => dispatch(actions.receiveOperation({ data })),
      clearReceivedOperation: () => dispatch(actions.clearReceivedOperation()),
    },
  ];
};
