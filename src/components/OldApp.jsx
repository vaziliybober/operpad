/* eslint-disable no-await-in-loop */
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { v4 as uuidV4 } from 'uuid';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ot from '@vaziliybober/operlib';
import { Container, Row, Col, Button, Jumbotron } from 'react-bootstrap';
import routes from '../routes.js';
import Editor from './Editor.jsx';

const RETRY_INTERVAL = 300;

const withRetryHandling = (callback, delay = 400) =>
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

const sendOperation = (operation, clientId, documentId, syncIndex) => {
  withRetryHandling(async () => {
    await axios.post(routes.userInputPath(documentId), {
      operation,
      clientId,
      syncIndex,
    });
  }, RETRY_INTERVAL)();
};

const App = ({
  clientId,
  documentId,
  initialText,
  initialRevisionIndex,
  mode = 'default',
}) => {
  const text = useRef(initialText);
  const awaited = useRef(ot.make());
  const buffered = useRef(ot.make());
  const syncIndex = useRef(initialRevisionIndex);
  const lastRevisionIndex = useRef(initialRevisionIndex);

  const [editorText, setEditorText] = useState(initialText);
  const [newDocumentId, setNewDocumentId] = useState(uuidV4());

  const demoToSend = useRef(ot.make());
  const [demoAlreadySent, setDemoAlreadySent] = useState(true);
  const [demoLogs, setDemoLogs] = useState('');

  const onNewDocument = () => {
    setNewDocumentId(uuidV4());
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

  const processRevision = ({ operation, clientId: originClientId, index }) => {
    const acknowledgedOwnOperation = originClientId === clientId;
    syncIndex.current = index;
    if (acknowledgedOwnOperation) {
      awaited.current = buffered.current;
      buffered.current = ot.make();
      if (awaited.current.length !== 0) {
        if (mode === 'default') {
          sendOperation(
            awaited.current,
            clientId,
            documentId,
            syncIndex.current,
          );
        }
        if (mode === 'demo') {
          demoToSend.current = awaited.current;
          setDemoAlreadySent(false);
        }
      }
    } else {
      const [operTransformedOnce, transformedAwaited] = ot.transform(
        operation,
        awaited.current,
      );

      const [operTransformedTwice, transformedBuffered] = ot.transform(
        operTransformedOnce,
        buffered.current,
      );

      const newText = ot.apply(text.current, operTransformedTwice);
      setEditorText(newText);
      text.current = newText;

      awaited.current = transformedAwaited;
      buffered.current = transformedBuffered;
    }
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
            ot.toString(rev.operation),
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await loadNewOperations();
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
    }
  }, []);

  const handleChange = (operation) => {
    // console.log('User input operation detected:', ot.toString(operation));
    text.current = ot.apply(text.current, operation);
    if (awaited.current.length === 0) {
      awaited.current = operation;
      if (mode === 'default') {
        sendOperation(operation, clientId, documentId, syncIndex.current);
      }
      if (mode === 'demo') {
        demoToSend.current = operation;
        setDemoAlreadySent(false);
      }
      // socket.emit('user-input', { operation, clientId, syncIndex });
    } else {
      buffered.current = ot.compose(buffered.current, operation);
    }

    printState();
  };

  const handleSend = () => {
    sendOperation(awaited.current, clientId, documentId, syncIndex.current);
    setDemoAlreadySent(true);
    setDemoLogs(`Sent operation ${ot.toString(awaited.current)}`);
  };

  const handleReceive = () => {
    loadNewOperations();
  };

  const demoModeJSX = (
    <div>
      <button type="button" onClick={handleSend} disabled={demoAlreadySent}>
        Send
      </button>
      <button type="button" onClick={handleReceive}>
        Receive
      </button>
      <div>{demoLogs}</div>
    </div>
  );

  return (
    <>
      <Jumbotron className="bg-dark">
        <h1 className="text-center text-white mb-3">Operpad</h1>
        <div className="text-center">
          <Button
            className="shadow-none border-light mr-3 ml-auto"
            variant="dark"
            target="_blank"
            href={`../documents/${newDocumentId}`}
            onClick={onNewDocument}
          >
            New document
          </Button>
          <CopyToClipboard text={window.location.href}>
            <Button className="shadow-none border-light" variant="dark">
              Copy link
            </Button>
          </CopyToClipboard>
        </div>
      </Jumbotron>
      <Container>
        <Row>
          <Col className="d-flex justify-content-center pb-3 pt-3 ml-auto">
            {mode === 'demo' ? demoModeJSX : null}
          </Col>
        </Row>
        <Row>
          <Col className="border border-dark p-0">
            <Editor text={editorText} onChange={handleChange} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default App;
