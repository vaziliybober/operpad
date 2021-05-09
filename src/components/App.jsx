/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
import React from 'react';
import { Container, Row, Col, Button, Jumbotron } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ot from '@vaziliybober/operlib';
import axios from 'axios';
import NewDocumentButton from './NewDocumentButton.jsx';
import Editor from './Editor.jsx';
import { withRetry } from '../lib/index.js';
import routes from '../routes.js';

const RETRY_INTERVAL = 300;

const App = ({ clientId, documentId, initialText, initialRevisionIndex }) => {
  const [text, setText] = React.useState(initialText);
  const [awaited, setAwaited] = React.useState(ot.make());
  const [operToSend, setOperToSend] = React.useState(ot.make());
  const [buffered, setBuffered] = React.useState(ot.make());
  const [revisions, setRevisions] = React.useState([]);
  const [state, setState] = React.useState('editing');
  const [syncIndex, setSyncIndex] = React.useState(initialRevisionIndex);
  const [lastRevisionIndex, setLastRevisionIndex] = React.useState(
    initialRevisionIndex,
  );

  React.useEffect(() => {
    const sendWithRetry = withRetry(async () => {
      await axios.post(routes.userInputPath(documentId), {
        operation: operToSend,
        clientId,
        syncIndex,
      });
    }, RETRY_INTERVAL);

    if (operToSend.length !== 0) {
      sendWithRetry();
    }
  }, [operToSend]);

  const handleUserInput = (operation) => {
    setText((prevText) => ot.apply(prevText, operation));
    if (awaited.length === 0) {
      setAwaited(operation);
      setOperToSend(operation);
    } else {
      setBuffered((prevBuffered) => ot.compose(prevBuffered, operation));
    }
  };

  React.useEffect(() => {
    if (revisions.length === 0) {
      setState('editing');
    } else {
      setState('revising');
    }
  }, [revisions]);

  React.useEffect(async () => {
    if (state === 'revising') {
      return;
    }

    while (true) {
      try {
        await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
        const response = await axios.get(
          routes.newOperationsPath(documentId, lastRevisionIndex),
        );
        const newRevisions = response.data;
        if (newRevisions.length > 0) {
          setLastRevisionIndex(newRevisions[newRevisions.length - 1].index);
          setRevisions(newRevisions);
          break;
        }
      } catch (e) {
        console.log("Couldn't load new operations", e);
      }
    }
  }, [state]);

  React.useEffect(() => {
    if (state === 'editing' || revisions.length === 0) {
      return;
    }

    const { operation, clientId: originClientId, index } = revisions[0];
    setSyncIndex(index);

    const acknowledgedOwnOperation = originClientId === clientId;

    if (acknowledgedOwnOperation) {
      setAwaited(buffered);
      setOperToSend(buffered);
      setBuffered(ot.make());
    } else {
      const [operTransformedOnce, transformedAwaited] = ot.transform(
        operation,
        awaited,
      );

      const [operTransformedTwice, transformedBuffered] = ot.transform(
        operTransformedOnce,
        buffered,
      );

      setText((prevText) => ot.apply(prevText, operTransformedTwice));
      setAwaited(transformedAwaited);
      setBuffered(transformedBuffered);
    }

    setRevisions((prevRevisions) => prevRevisions.slice(1));
  }, [revisions, state]);

  return (
    <>
      <Jumbotron className="bg-dark">
        <h1 className="text-center text-white mb-3">Operpad</h1>
        <div className="text-center">
          <NewDocumentButton />
          <CopyToClipboard text={window.location.href}>
            <Button className="shadow-none border-light" variant="dark">
              Copy link
            </Button>
          </CopyToClipboard>
        </div>
      </Jumbotron>
      <Container className="mb-5">
        <Row className="mb-3">
          <Col className="border border-dark p-0">
            <Editor text={text} onUserInput={handleUserInput} />
          </Col>
        </Row>
        {/* <Row className="mb-3 justify-content-center">
          <Col>
            <Button className="border-dark mr-3" variant="light">
              Send
            </Button>
            <Button className="border-dark" variant="light">
              Receive
            </Button>
          </Col>
        </Row> */}
      </Container>
    </>
  );
};

export default App;
