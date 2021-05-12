/* eslint-disable react/no-array-index-key */
import _ from 'lodash';
import React from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Keyboard,
  ArrowRight,
  Check,
  Flag,
} from 'react-bootstrap-icons';
import { Accordion, Card } from 'react-bootstrap';
import Operation from '../components/Operation.jsx';

export const makeInitial = () => ({
  type: 'initial',
  id: _.uniqueId(),
  header: <Flag />,
  body: null,
});

export const makeSent = (operation, awaited, buffered) => ({
  type: 'sent',
  id: _.uniqueId(),
  header: (
    <div className="d-flex align-items-center">
      <ArrowUpCircle className="mr-3" color="blue" />
      <div>Sent an operation</div>
    </div>
  ),
  body: (
    <div>
      <Accordion className="mb-2">
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="0">
            Awaited
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <Operation operation={awaited} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="1">
            Buffered
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="1">
            <Card.Body>
              <Operation operation={buffered} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <div className="ml-4">Operation</div>
      <Operation operation={operation} />
    </div>
  ),
});

export const makeRevised = (
  operation,
  transformedOperation,
  awaited,
  transformedAwaited,
  buffered,
  transformedBuffered,
  text,
  transformedText,
) => ({
  type: 'received',
  id: _.uniqueId(),
  header: (
    <div className="d-flex align-items-center">
      <ArrowRight className="mr-3" color="red" />
      <div>Revised an operation</div>
    </div>
  ),
  body: (
    <div>
      <div className="d-flex">
        <div className="mr-3">
          <Operation operation={operation} />
        </div>

        <Operation operation={transformedOperation} />
      </div>
    </div>
  ),
});

export const makeLoaded = (operations) => ({
  type: 'loaded',
  id: _.uniqueId(),
  header: (
    <div className="d-flex align-items-center">
      <ArrowDownCircle className="mr-3" color="green" />
      <div>{`Loaded ${operations.length} new operations`}</div>
    </div>
  ),
  body: (
    <div>
      {operations.map((oper, i) => (
        <div className="d-flex mb-3">
          <Operation key={i} operation={oper} />
        </div>
      ))}
    </div>
  ),
});

export const makeEdited = (operation, awaited, buffered) => ({
  type: 'edited',
  id: _.uniqueId(),
  header: (
    <div className="d-flex align-items-center">
      <Keyboard className="mr-3" />
      <div>Edited the document</div>
    </div>
  ),
  body: (
    <div>
      <Accordion className="mb-2">
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="1">
            Awaited
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="1">
            <Card.Body>
              <Operation operation={awaited} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="2">
            Buffered
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="2">
            <Card.Body>
              <Operation operation={buffered} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <div className="ml-4">Operation</div>
      <Operation operation={operation} />
    </div>
  ),
});

export const makeAcknowledged = (operation) => ({
  type: 'acknowledged',
  id: _.uniqueId(),
  header: (
    <div className="d-flex align-items-center">
      <Check className="mr-3" color="orange" />
      <div>Aknowledged own operation</div>
    </div>
  ),
  body: <Operation operation={operation} />,
});
