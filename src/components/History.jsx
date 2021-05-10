import React from 'react';
import { Accordion, Card } from 'react-bootstrap';
import { Fade } from 'react-awesome-reveal';

const History = ({ history }) => {
  const getCardJsx = ({ id, header, body }, i) => (
    <Card key={id}>
      <Accordion.Toggle
        as={Card.Header}
        eventKey={id}
        className="d-flex align-items-center"
      >
        <div className="mr-2">{`${history.length - i - 1}.`}</div>
        {header}
      </Accordion.Toggle>
      {body ? (
        <Accordion.Collapse eventKey={id}>
          <Card.Body>{body}</Card.Body>
        </Accordion.Collapse>
      ) : null}
    </Card>
  );

  return (
    <Accordion>
      {history
        .slice()
        .reverse()
        .map((action, i) =>
          i === 0 ? (
            <Fade key={action.id}>{getCardJsx(action, i)}</Fade>
          ) : (
            getCardJsx(action, i)
          ),
        )}
    </Accordion>
  );
};

export default History;
