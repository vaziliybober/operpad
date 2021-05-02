import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import useOperations from '../hooks/useOperations.js';
import useToReceive from '../hooks/useToReceive.js';
import useText from '../hooks/useText.js';
import { useSocketContext } from '../contexts/SocketContext.jsx';
import { useUserIdContext } from '../contexts/UserIdContext.jsx';
import { transform, apply } from '../../lib/index.js';

const findSum = (numbers) => numbers.reduce((a, b) => a + b, 0);

const App = ({ text: initialText }) => {
  const [
    operations,
    {
      addUserOperation,
      aknowledgeOwnOperation,
      transformAwaited,
      transformBuffer,
    },
  ] = useOperations();
  const [toReceive, { clearReceivedOperation }] = useToReceive();
  const socket = useSocketContext();
  const userId = useUserIdContext();
  const [text, setText] = useText(initialText);
  const [canSend, setCanSend] = useState(true);

  const handleSend = () => {
    const data = {
      operation: operations.awaited,
      syncedAt: operations.syncedAt,
      userId,
    };
    console.log('Sent operation. Data: ', data);
    socket.emit('operation', data);
    setCanSend(false);
  };

  const handleReceive = () => {
    const received = toReceive[0];
    console.log('Received operation: Data: ', received);
    clearReceivedOperation();
    const { userId: receivedUserId, revisionIndex } = received;
    if (receivedUserId === userId) {
      console.log(
        'Aknowledged own operation, syncronized at revision ',
        revisionIndex,
      );
      aknowledgeOwnOperation(revisionIndex);
      setCanSend(true);
    } else {
      const transformedOperation = operations.awaited
        .concat(operations.buffer)
        .reduce(
          (acc, receivedO) => acc.map((o) => transform(o, receivedO, true)),
          received.operation,
        );
      const transformedOperationForBuffer = operations.awaited.reduce(
        (acc, receivedO) => acc.map((o) => transform(o, receivedO, true)),
        received.operation,
      );
      console.log(
        'Transformed received operation for buffer:',
        transformedOperationForBuffer,
      );
      console.log('Transformed received operation:', transformedOperation);
      const newText = transformedOperation.reduce(
        (acc, o) => apply(o, acc),
        text,
      );
      setText(newText);
      console.log('Applied transformed operation');

      const transformedAwaited = received.operation.reduce(
        (acc, awaitedO) => acc.map((o) => transform(o, awaitedO)),
        operations.awaited,
      );
      console.log('Awaited: ', operations.awaited);
      console.log('Transformed awaited:', transformedAwaited);
      transformAwaited(transformedAwaited);

      const transformedBuffer = transformedOperationForBuffer.reduce(
        (acc, bufferO) => acc.map((o) => transform(o, bufferO)),
        operations.buffer,
      );
      console.log('Buffer: ', operations.buffer);
      console.log('Transformed buffer:', transformedBuffer);
      transformBuffer(transformedBuffer);
    }
  };

  const handleChange = (editor, change) => {
    if (change.origin === 'setValue') {
      return;
    }
    setText(editor.getValue());

    const { lines } = editor.doc.children[0];

    const pos =
      findSum(
        lines.slice(0, change.from.line).map((line) => line.text.length + 1),
      ) + change.from.ch;

    const { removed, text: inserted } = change;
    const somethingWasRemoved = !(removed.length === 1 && removed[0] === '');
    const somethingWasInserted = !(inserted.length === 1 && inserted[0] === '');

    const buildRemoveO = () => {
      const length =
        findSum(removed.map((r) => r.length)) + (removed.length - 1);
      return {
        type: 'remove',
        data: {
          pos,
          length,
        },
      };
    };

    const buildInsertO = () => {
      const content = inserted.join('\n');
      return {
        type: 'insert',
        data: {
          pos,
          content,
        },
      };
    };

    if (somethingWasRemoved && somethingWasInserted) {
      addUserOperation(buildRemoveO(), buildInsertO());
    } else if (somethingWasRemoved) {
      addUserOperation(buildRemoveO());
    } else if (somethingWasInserted) {
      addUserOperation(buildInsertO());
    } else {
      throw new Error('Nothing was removed or inserted!');
    }
  };

  return (
    <>
      <h1 className="text-center">Operpad</h1>
      <div className="h-50 pb-3 border border-secondary">
        <CodeMirror
          value={text}
          onChange={handleChange}
          options={{
            configureMouse: () => ({ addNew: false }),
          }}
        />
        <button
          type="button"
          className="mt-5 mr-3"
          onClick={handleSend}
          disabled={!canSend || operations.awaited.length === 0}
        >
          send
        </button>
        <button
          type="button"
          className="mt-5"
          onClick={handleReceive}
          disabled={toReceive.length === 0}
        >
          receive
        </button>
      </div>
    </>
  );
};

export default App;
