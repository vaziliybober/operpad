/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
import React from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Jumbotron,
  Spinner,
} from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ot from '@vaziliybober/operlib';
import axios from 'axios';
import { Check2 } from 'react-bootstrap-icons';
import { Fade } from 'react-awesome-reveal';
import NewDocumentButton from './NewDocumentButton.jsx';
import Editor from './Editor.jsx';
import { withRetry } from '../lib/index.js';
import routes from '../routes.js';
import History from './History.jsx';
import {
  makeInitial,
  makeSent,
  makeLoaded,
  makeRevised,
  makeAcknowledged,
  makeEdited,
} from '../lib/actions.jsx';

const RETRY_INTERVAL = 300;

const App = ({
  clientId,
  documentId,
  initialText,
  initialRevisionIndex,
  mode = 'default',
}) => {
  const [text, setText] = React.useState(initialText);
  const [awaited, setAwaited] = React.useState(ot.make());
  const [operToSend, setOperToSend] = React.useState(ot.make());
  const [buffered, setBuffered] = React.useState(ot.make());
  const [revisions, setRevisions] = React.useState([]);
  const [state, setState] = React.useState('editing');
  const [isLoading, setIsLoading] = React.useState(false);
  const [syncIndex, setSyncIndex] = React.useState(initialRevisionIndex);
  const [lastRevisionIndex, setLastRevisionIndex] = React.useState(
    initialRevisionIndex,
  );
  const [history, setHistory] = React.useState([makeInitial()]);

  const addToHistory = (action) => {
    setHistory((prevHistory) => [...prevHistory, action]);
  };

  const sendOperation = () => {
    const sendWithRetry = withRetry(async () => {
      await axios.post(routes.userInputPath(documentId), {
        operation: operToSend,
        clientId,
        syncIndex,
      });
    }, RETRY_INTERVAL);

    addToHistory(makeSent(operToSend, awaited, buffered));
    sendWithRetry();
    setOperToSend(ot.make());
  };

  const loadRevisions = async () => {
    setIsLoading(true);
    while (true) {
      try {
        const response = await axios.get(
          routes.newOperationsPath(documentId, lastRevisionIndex),
        );
        const newRevisions = response.data;
        if (newRevisions.length > 0) {
          setLastRevisionIndex(newRevisions[newRevisions.length - 1].index);
          setRevisions(newRevisions);
          addToHistory(makeLoaded(newRevisions));
          setIsLoading(false);
          break;
        }
        await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
      } catch (e) {
        console.log("Couldn't load new operations", e);
      }
    }
  };

  const revise = () => {
    const { operation, clientId: originClientId, index } = revisions[0];
    setSyncIndex(index);

    const acknowledgedOwnOperation = originClientId === clientId;

    if (acknowledgedOwnOperation) {
      setAwaited(buffered);
      setOperToSend(buffered);
      setBuffered(ot.make());
      addToHistory(makeAcknowledged(awaited));
    } else {
      const [operTransformedOnce, transformedAwaited] = ot.transform(
        operation,
        awaited,
      );

      const [operTransformedTwice, transformedBuffered] = ot.transform(
        operTransformedOnce,
        buffered,
      );

      const newText = ot.apply(text, operTransformedTwice);
      setText(newText);
      setAwaited(transformedAwaited);
      setBuffered(transformedBuffered);
      addToHistory(
        makeRevised(
          operation,
          operTransformedTwice,
          awaited,
          transformedAwaited,
          buffered,
          transformedBuffered,
          text,
          newText,
        ),
      );
    }

    setRevisions((prevRevisions) => prevRevisions.slice(1));
  };

  const handleUserInput = (operation) => {
    const newText = ot.apply(text, operation);
    let hAwaited = awaited;
    let hBuffered = buffered;
    setText(newText);
    if (awaited.length === 0) {
      setAwaited(operation);
      hAwaited = operation;
      setOperToSend(operation);
    } else {
      const newBuffered = ot.compose(buffered, operation);
      setBuffered(newBuffered);
      hBuffered = newBuffered;
    }

    addToHistory(makeEdited(operation, hAwaited, hBuffered, text, newText));
  };

  React.useEffect(() => {
    if (revisions.length === 0) {
      setState('editing');
    } else {
      setState('revising');
      console.log('here');
    }
  }, [revisions]);

  React.useEffect(() => {
    if (mode === 'default' && operToSend.length > 0) {
      sendOperation();
    }
  }, [operToSend]);

  React.useEffect(async () => {
    if (mode === 'default' && state !== 'revising') {
      console.log('here');
      await loadRevisions();
    }
  }, [state]);

  React.useEffect(() => {
    if (mode === 'default' && state !== 'editing' && revisions.length > 0) {
      revise();
    }
  }, [revisions, state]);

  const demoModeJSX = (
    <>
      <Row className="mb-3">
        <Col className="d-flex align-items-center">
          <Button
            className="border-dark mr-3"
            variant="light"
            onClick={() => sendOperation()}
            disabled={operToSend.length === 0}
          >
            Send
          </Button>

          <Button
            className="border-dark mr-3"
            variant="light"
            onClick={() => revise()}
            disabled={state === 'editing' || revisions.length === 0}
          >
            Receive
          </Button>
          <Button
            className="border-dark mr-3"
            variant="light"
            onClick={() => loadRevisions()}
            disabled={state === 'revising'}
          >
            Load
          </Button>

          {isLoading ? (
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          ) : (
            <Fade>
              <Check2 size={30} />
            </Fade>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <History history={history} />
        </Col>
      </Row>
    </>
  );

  return (
    <>
      <Jumbotron className="bg-dark">
        <h1 className="text-center text-white mb-3">Operpad</h1>
        <div className="text-center">
          <NewDocumentButton />
          <CopyToClipboard text={window.location.href}>
            <Button className="border-light" variant="dark">
              Copy link
            </Button>
          </CopyToClipboard>
        </div>
      </Jumbotron>
      <Container className="mb-5">
        <Row className="mb-3">
          <Col className="border border-dark p-0">
            <Editor
              text={text}
              onUserInput={handleUserInput}
              disabled={state === 'revising'}
            />
          </Col>
        </Row>
        {mode === 'demo' ? demoModeJSX : null}
      </Container>
    </>
  );
};

export default App;
