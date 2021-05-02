import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../slices/index.js';

export default () => {
  const dispatch = useDispatch();
  const operations = useSelector((state) => state.operations);

  return [
    operations,
    {
      addUserOperation: (...oper) =>
        dispatch(actions.addUserOperation({ operation: oper })),
      aknowledgeOwnOperation: (revisionIndex) => {
        dispatch(actions.aknowledgeOwnOperation({ revisionIndex }));
      },
      transformAwaited: (transformedAwaited) => {
        dispatch(actions.transformAwaited({ transformedAwaited }));
      },
      transformBuffer: (transformedBuffer) => {
        dispatch(actions.transformBuffer({ transformedBuffer }));
      },
    },
  ];
};
