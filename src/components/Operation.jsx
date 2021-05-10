import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Pencil, EraserFill } from 'react-bootstrap-icons';

const atomicToJSX = ({ type, data }) => {
  if (type === 'insert') {
    return (
      <div className="d-flex align-items-center">
        <Pencil color="green" className="mr-2" />
        <div>{`insert: pos=${data.pos}, content="${data.content}"`}</div>
      </div>
    );
  }

  if (type === 'remove') {
    return (
      <div className="d-flex align-items-center">
        <EraserFill color="red" className="mr-2" />
        <div>{`remove: pos=${data.pos}, length=${data.length}`}</div>
      </div>
    );
  }

  throw new Error('Unexpected atomic operation type:', type);
};

const Operation = ({ operation }) => (
  <ListGroup>
    {operation.map((aOper, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <ListGroup.Item key={i}>{atomicToJSX(aOper)}</ListGroup.Item>
    ))}
  </ListGroup>
);

export default Operation;
