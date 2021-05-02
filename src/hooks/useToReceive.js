import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../slices/index.js';
import Operation from '../../lib/operation.js';

export default () => {
  const dispatch = useDispatch();
  const toReceive = useSelector((state) => state.toReceive);

  return [
    toReceive.map((data) => ({
      ...data,
      operation: Operation.fromJSON(data.operation),
    })),
    {
      receiveOperation: (data) => dispatch(actions.receiveOperation({ data })),
      clearReceivedOperation: () => dispatch(actions.clearReceivedOperation()),
    },
  ];
};
