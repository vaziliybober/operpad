import { useSelector, useDispatch } from 'react-redux';
import Operation from '../../lib/operation.js';

import { actions } from '../slices/index.js';

export default () => {
  const dispatch = useDispatch();
  const operations = useSelector((state) => state.operations);
  const awaited = Operation.fromJSON(operations.awaited);
  const buffer = Operation.fromJSON(operations.buffer);
  const { syncedAt } = operations;

  return [
    {
      awaited,
      buffer,
      syncedAt,
    },
    {
      setAwaitedOperation: (operation) => {
        dispatch(
          actions.setAwaitedOperation({ operation: operation.toJSON() }),
        );
      },
      addBufferOperation: (operation) => {
        dispatch(actions.addBufferOperation({ operation: operation.toJSON() }));
      },
      aknowledgeOwnOperation: (revisionIndex) => {
        dispatch(actions.aknowledgeOwnOperation({ revisionIndex }));
      },
      transformAwaited: (transformedAwaited) => {
        dispatch(
          actions.transformAwaited({
            transformedAwaited: transformedAwaited.toJSON(),
          }),
        );
      },
      transformBuffer: (transformedBuffer) => {
        dispatch(
          actions.transformBuffer({
            transformedBuffer: transformedBuffer.toJSON(),
          }),
        );
      },
    },
  ];
};
