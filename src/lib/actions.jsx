/* eslint-disable react/no-array-index-key */
import _ from 'lodash';
import React from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Keyboard,
  ArrowRight,
  Check2,
  Flag,
  ArrowBarRight,
} from 'react-bootstrap-icons';
import { Accordion, Card } from 'react-bootstrap';
import Operation from '../components/Operation.jsx';

export const makeInitial = () => ({
  type: 'initial',
  id: _.uniqueId(),
  header: <Flag />,
  body: null,
});

export const makeSent = (operation) => ({
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
      <Operation operation={operation} />
    </div>
  ),
});

export const makeRevised = (operation, transformedOperation) => ({
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
      <div className="d-flex align-items-center">
        <div className="mr-3">
          <Operation operation={operation} />
        </div>
        <ArrowBarRight size={30} className="mr-3" />
        <div>
          <Operation operation={transformedOperation} />
        </div>
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

export const makeEdited = (operation) => ({
  type: 'edited',
  id: _.uniqueId(),
  header: (
    <div className="d-flex align-items-center">
      <Keyboard className="mr-3" color="brown" />
      <div>Edited the document</div>
    </div>
  ),
  body: (
    <div>
      <Operation operation={operation} />
    </div>
  ),
});

export const makeAcknowledged = (operation) => ({
  type: 'acknowledged',
  id: _.uniqueId(),
  header: (
    <div className="d-flex align-items-center">
      <Check2 className="mr-3" color="orange" />
      <div>Aknowledged own operation</div>
    </div>
  ),
  body: <Operation operation={operation} />,
});
