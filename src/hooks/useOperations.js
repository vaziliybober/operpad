import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../slices/index.js';

export default () => {
  const dispatch = useDispatch();
  const operations = useSelector((state) => state.operations);

  return [
    operations,
    {
      addUserOperations: (...opers) =>
        dispatch(actions.addUserOperations({ operations: opers })),
    },
  ];
};
