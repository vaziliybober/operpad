import React, { useState, useRef, useEffect } from 'react';
import Editor from './Editor.jsx';
import useSocket from '../hooks/useSocket.js';
import useInterval from '../hooks/useInterval.js';
import axios from 'axios';
import makeOperation, {
  toStringOperation,
  composeOperations,
  transform,
  apply,
} from '../lib/operation.js';
import routes from '../routes.js';
import { v4 as uuidV4 } from 'uuid';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const RETRY_INTERVAL = 300;

export const withRetryHandling = (callback, delay = 400) =>
  function callbackWithRetryHandling(...params) {
    const retry = async (attempt = 1) => {
      try {
        return await callback(...params);
      } catch (error) {
        console.log('Retry because of', error);
        return new Promise((resolve) =>
          setTimeout(() => resolve(retry(attempt + 1)), delay),
        );
      }
    };

    return retry();
  };

const App = ({
  clientId,
  documentId,
  initialText,
  initialRevisionIndex,
  mode = 'default',
}) => {
  const text = useRef(initialText);
  const awaited = useRef(makeOperation());
  const buffered = useRef(makeOperation());
  const syncIndex = useRef(initialRevisionIndex);
  const lastRevisionIndex = useRef(initialRevisionIndex);

  const [editorText, setEditorText] = useState(initialText);
  const [newDocumentId, setNewDocumentId] = useState(uuidV4());

  const demoToSend = useRef(makeOperation());
  const [demoAlreadySent, setDemoAlreadySent] = useState(true);
  const [demoLogs, setDemoLogs] = useState('');

  const onNewDocument = () => {
    setNewDocumentId(uuidV4());
  };

  const sendOperation = (operation, clientId, syncIndex) => {
    withRetryHandling(async () => {
      await axios.post(routes.userInputPath(documentId), {
        operation,
        clientId,
        syncIndex,
      });
    }, RETRY_INTERVAL)();
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadNewOperations();
  //   }, RETRY_INTERVAL);
  // }, []);

  const printState = () => {
    console.log({
      text: text.current,
      awaited: awaited.current,
      buffered: buffered.current,
      syncIndex: syncIndex.current,
      lastRevisionIndex: lastRevisionIndex.current,
    });
  };

  const loadNewOperations = async () => {
    try {
      const response = await axios.get(
        routes.newOperationsPath(documentId, lastRevisionIndex.current),
      );
      const revisions = response.data;
      if (revisions.length > 0) {
        lastRevisionIndex.current = revisions[revisions.length - 1].index;
      }
      if (mode === 'demo') {
        setDemoLogs(
          `Received operations ${revisions.map((rev) =>
            toStringOperation(rev.operation),
          )}`,
        );
      }

      console.log(revisions);
      revisions.forEach(processRevision);
      printState();
    } catch (e) {
      console.log('error newOperations:', e);
    }
  };

  useEffect(async () => {
    if (mode === 'demo') {
      return;
    }
    while (true) {
      await loadNewOperations();
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
    }
  }, []);

  //useInterval(loadNewOperations, RETRY_INTERVAL);

  const handleChange = (operation) => {
    // console.log('User input operation detected:', toStringOperation(operation));
    text.current = apply(text.current, operation);
    if (awaited.current.length === 0) {
      awaited.current = operation;
      if (mode === 'default') {
        sendOperation(operation, clientId, syncIndex.current);
      }
      if (mode === 'demo') {
        demoToSend.current = operation;
        setDemoAlreadySent(false);
      }
      //socket.emit('user-input', { operation, clientId, syncIndex });
    } else {
      buffered.current = composeOperations(buffered.current, operation);
    }

    printState();
  };

  const processRevision = ({ operation, clientId: originClientId, index }) => {
    const acknowledgedOwnOperation = originClientId === clientId;
    syncIndex.current = index;
    if (acknowledgedOwnOperation) {
      awaited.current = buffered.current;
      buffered.current = makeOperation();
      if (awaited.current.length !== 0) {
        if (mode === 'default') {
          sendOperation(awaited.current, clientId, syncIndex.current);
        }
        if (mode === 'demo') {
          demoToSend.current = awaited.current;
          setDemoAlreadySent(false);
        }
      }
    } else {
      const [operTransformedOnce, transformedAwaited] = transform(
        operation,
        awaited.current,
      );

      const [operTransformedTwice, transformedBuffered] = transform(
        operTransformedOnce,
        buffered.current,
      );

      const newText = apply(text.current, operTransformedTwice);
      setEditorText(newText);
      text.current = newText;

      awaited.current = transformedAwaited;
      buffered.current = transformedBuffered;
    }
  };

  const handleSend = () => {
    sendOperation(awaited.current, clientId, syncIndex.current);
    setDemoAlreadySent(true);
    setDemoLogs(`Sent operation ${toStringOperation(awaited.current)}`);
  };

  const handleReceive = () => {
    loadNewOperations();
  };

  const demoModeJSX = (
    <div>
      <button onClick={handleSend} disabled={demoAlreadySent}>
        Send
      </button>
      <button onClick={handleReceive}>Receive</button>
      <div>{demoLogs}</div>
    </div>
  );

  return (
    <>
      <h1 className="text-center pb-3 pt-3">Operpad</h1>
      <div className="border border-secondary bg-white">
        <Editor text={editorText} onChange={handleChange} />
      </div>
      <button onClick={onNewDocument}>
        <a
          href={`../documents/${newDocumentId}`}
          target="_blank"
          rel="noreferrer"
        >
          New document
        </a>
      </button>
      <CopyToClipboard text={window.location.href}>
        <button>Copy link</button>
      </CopyToClipboard>
      {mode === 'demo' ? demoModeJSX : null}
    </>
  );
};

export default App;
