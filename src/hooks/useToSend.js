import { useSelector, useDispatch } from 'react-redux';

import _ from 'lodash';
import { actions } from '../slices/index.js';
import Operation from '../../lib/operation.js';

export default () => {
  const dispatch = useDispatch();
  const toSend = useSelector((state) => state.toSend);
  const dataToSend = _.isEmpty(toSend)
    ? {}
    : {
        ...toSend,
        operation: Operation.fromJSON(toSend.operation),
      };

  return [
    dataToSend,
    {
      sendOperation: (data) =>
        dispatch(
          actions.sendOperation({
            data: { ...data, operation: data.operation.toJSON() },
          }),
        ),
      clearSentOperation: () => dispatch(actions.clearSentOperation()),
    },
  ];
};
