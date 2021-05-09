import React from 'react';
import { Container, Row, Col, Button, Jumbotron } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import History from './History.jsx';
import Editor from './Editor.jsx';
import NewDocumentButton from './NewDocumentButton.jsx';
import _ from 'lodash';

const App = () => {
  const [history, setHistory] = React.useState([
    { type: 'receive', id: _.uniqueId() },
    { type: 'send', id: _.uniqueId() },
  ]);

  const [text, setText] = React.useState('hello');

  const handleUserInput = (value) => {
    setText(value);
  };

  React.useEffect(async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      setText((prev) => 'd' + prev);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }, []);

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
        <Row className="mb-3 justify-content-center">
          <Col>
            <Button className="border-dark mr-3" variant="light">
              Send
            </Button>
            <Button className="border-dark" variant="light">
              Receive
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <History history={history} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default App;
