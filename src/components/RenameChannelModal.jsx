import React from 'react';
import { Modal } from 'react-bootstrap';
import axios from 'axios';

import routes from '../routes.js';
import ChannelNameForm from './ChannelNameForm.jsx';
import useChannels from '../hooks/useChannels.js';

const RenameChannelModal = (props) => {
  const {
    show,
    onClose,
    args: { renameId },
  } = props;
  const [{ channels }] = useChannels();

  const handleRename = async ({ channelName }) => {
    const params = {
      id: renameId,
    };
    const data = {
      attributes: { name: channelName },
    };
    await axios.patch(routes.channelPath(renameId), { data, params });
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Rename channel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ChannelNameForm
          channelNames={channels.map((ch) => ch.name)}
          onSubmit={handleRename}
          onCancel={onClose}
        />
      </Modal.Body>
    </Modal>
  );
};

export default RenameChannelModal;
