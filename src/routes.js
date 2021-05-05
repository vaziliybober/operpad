const host = '';
const prefix = 'api/v1';

export default {
  userInputPath: () => [host, prefix, 'userInput'].join('/'),
  newOperationsPath: (lastRevisionIndex) =>
    [host, prefix, 'newOperations', lastRevisionIndex].join('/'),
};
