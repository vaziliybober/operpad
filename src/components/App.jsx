import React, { useState, useRef } from 'react';
import Editor from './Editor.jsx';
import useSocket from '../hooks/useSocket';
import makeOperation, {
  toStringOperation,
  composeOperations,
  transform,
  apply,
} from '../lib/operation.js';

const App = ({ clientId, initialText, initialSyncIndex }) => {
  const text = useRef(initialText);
  const [editorText, setEditorText] = useState(initialText);
  const [awaited, setAwaited] = useState(makeOperation());
  const [buffered, setBuffered] = useState(makeOperation());
  const [syncIndex, setSyncIndex] = useState(initialSyncIndex);

  const socket = useSocket((sock) => {
    sock.on(
      'broadcast-operation',
      ({ operation, clientId: originClientId, revisionIndex }) => {
        // console.log(toStringOperation(operation));
        const acknowledgedOwnOperation = originClientId === clientId;
        if (acknowledgedOwnOperation) {
          const newAwaited = buffered;
          if (newAwaited.length !== 0) {
            sock.emit('user-input', {
              operation: newAwaited,
              clientId,
              syncIndex: revisionIndex,
            });
          }
          setAwaited(newAwaited);
          setBuffered(makeOperation());
          setSyncIndex(revisionIndex);
        } else {
          const [operTransformedOnce, transformedAwaited] = transform(
            operation,
            awaited,
          );

          const [operTransformedTwice, transformedBuffered] = transform(
            operTransformedOnce,
            buffered,
          );

          const newText = apply(text.current, operTransformedTwice);
          setEditorText(newText);
          text.current = newText;

          setAwaited(transformedAwaited);
          setBuffered(transformedBuffered);
        }
      },
    );

    return () => {
      socket.off('broadcast-operation');
    };
  });

  const handleChange = (operation) => {
    // console.log('User input operation detected:', toStringOperation(operation));
    if (awaited.length === 0) {
      text.current = apply(text.current, operation);
      socket.emit('user-input', { operation, clientId, syncIndex });
      setAwaited(operation);
    } else {
      setBuffered(composeOperations(buffered, operation));
    }
  };

  return (
    <>
      <h1 className="text-center pb-3 pt-3">Operpad</h1>
      <div className="border border-secondary bg-white">
        <Editor text={editorText} onChange={handleChange} />
      </div>
    </>
  );
};

export default App;
