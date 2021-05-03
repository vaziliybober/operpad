import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import _ from 'lodash';
import useOperations from '../hooks/useOperations.js';
import useToReceive from '../hooks/useToReceive.js';
import useText from '../hooks/useText.js';
import { useSocketContext } from '../contexts/SocketContext.jsx';
import { useUserIdContext } from '../contexts/UserIdContext.jsx';
import AtomicOperation from '../../lib/atomicOperation.js';
import Operation, { transform } from '../../lib/operation.js';
import useToSend from '../hooks/useToSend.js';

const findSum = (numbers) => numbers.reduce((a, b) => a + b, 0);

const App = ({ text: initialText }) => {
  const [
    operations,
    {
      setAwaitedOperation,
      addBufferOperation,
      aknowledgeOwnOperation,
      transformAwaited,
      transformBuffer,
    },
  ] = useOperations();
  const [toReceive, { clearReceivedOperation }] = useToReceive();
  const socket = useSocketContext();
  const userId = useUserIdContext();
  const [text, setText] = useText(initialText);
  const [toSend, { sendOperation, clearSentOperation }] = useToSend();
  const [userOperation, setUserOperation] = useState(null);
  const [usedOperation, setUsedOperation] = useState(false);

  useEffect(() => {
    if (userOperation === null) {
      return;
    }
    if (operations.awaited.atomicOperations.length === 0) {
      const data = {
        operation: userOperation,
        syncedAt: operations.syncedAt,
        userId,
      };
      sendOperation(data);
      setAwaitedOperation(userOperation);
    } else {
      addBufferOperation(userOperation);
    }
  }, [usedOperation]);

  const handleSend = () => {
    console.log('----------------');

    console.log('Sent operation: ', operations.awaited.toString());
    socket.emit('operation', toSend);
    clearSentOperation();
  };

  const handleReceive = () => {
    console.log('----------------');
    const received = toReceive[0];
    console.log('Received operation:', received.operation.toString());
    clearReceivedOperation();
    const { userId: receivedUserId, revisionIndex } = received;
    if (receivedUserId === userId) {
      console.log(
        'Aknowledged own operation, syncronized at revision ',
        revisionIndex,
      );
      if (operations.buffer.atomicOperations.length !== 0) {
        setAwaitedOperation(operations.buffer);
        const data = {
          operation: operations.buffer,
          syncedAt: revisionIndex,
          userId,
        };
        sendOperation(data);
      }

      aknowledgeOwnOperation(revisionIndex);
    } else {
      const [transformedOnceOperation, transformedAwaited] = transform(
        received.operation,
        operations.awaited,
      );
      console.log('Awaited: ', operations.awaited.toString());
      console.log('Transformed awaited:', transformedAwaited.toString());

      transformAwaited(transformedAwaited);

      console.log(
        'Transformed received operation once:',
        transformedOnceOperation.toString(),
      );

      const [transformedTwiceOperation, transformedBuffer] = transform(
        transformedOnceOperation,
        operations.buffer,
      );
      console.log('Buffer: ', operations.buffer.toString());
      console.log('Transformed buffer:', transformedBuffer.toString());
      transformBuffer(transformedBuffer);

      console.log(
        'Transformed received operation twice:',
        transformedTwiceOperation.toString(),
      );

      const newText = transformedTwiceOperation.apply(text);
      setText(newText);
      console.log('Applied transformed operation');
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
      console.log('pos:', pos, 'length:', length);
      return new AtomicOperation('remove', { pos, length });
    };

    const buildInsertO = () => {
      const content = inserted.join('\n');
      console.log('pos:', pos, 'content:', content);
      return new AtomicOperation('insert', { pos, content });
    };

    const buildAtomicOperations = () => {
      if (somethingWasRemoved && somethingWasInserted) {
        console.log('removed and inserted');
        return [buildRemoveO(), buildInsertO()];
      }
      if (somethingWasRemoved) {
        console.log('removed');
        return [buildRemoveO()];
      }
      if (somethingWasInserted) {
        console.log('inserted');
        return [buildInsertO()];
      }
      throw new Error('Nothing was removed or inserted!');
    };

    const operation = new Operation(...buildAtomicOperations());
    setUserOperation(operation);
    setUsedOperation((prevValue) => !prevValue);
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
          disabled={_.isEmpty(toSend)}
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
