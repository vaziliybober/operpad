import React from 'react';
import { Button } from 'react-bootstrap';
import { v4 as uuidV4 } from 'uuid';

const NewDocumentButton = () => {
  const [newDocumentId, setNewDocumentId] = React.useState(uuidV4());

  return (
    <Button
      className="shadow-none border-light mr-3 ml-auto"
      variant="dark"
      target="_blank"
      href={`../documents/${newDocumentId}`}
      onClick={() => setNewDocumentId(uuidV4())}
    >
      New document
    </Button>
  );
};

export default NewDocumentButton;
