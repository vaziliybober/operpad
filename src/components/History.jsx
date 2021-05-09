import React from 'react';
import { Accordion, Card } from 'react-bootstrap';

const History = ({ history }) => (
  <Accordion defaultActiveKey="0">
    {history.map((action) => (
      <Card key={action.id}>
        <Accordion.Toggle as={Card.Header} eventKey={action.id}>
          {action.type}
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={action.id}>
          <Card.Body>Hello! Im the body</Card.Body>
        </Accordion.Collapse>
      </Card>
    ))}
  </Accordion>
);

export default History;
