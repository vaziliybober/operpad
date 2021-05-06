const host = '';
const prefix = 'api/v1';

export default {
  userInputPath: (documentId) =>
    [host, prefix, 'userInput', documentId].join('/'),
  newOperationsPath: (documentId, lastRevisionIndex) =>
    [host, prefix, 'newOperations', documentId, lastRevisionIndex].join('/'),
};
