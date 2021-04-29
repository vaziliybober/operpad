import React from 'react';
import { Modal } from 'react-bootstrap';
import axios from 'axios';

import routes from '../routes.js';
import ChannelNameForm from './ChannelNameForm.jsx';
import useChannels from '../hooks/useChannels.js';

const AddModal = (props) => {
  const { show, onClose } = props;
  const [{ channels }] = useChannels();

  const handleAdd = async ({ channelName }) => {
    const data = {
      attributes: { name: channelName },
    };
    await axios.post(routes.channelsPath(), { data });
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add channel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ChannelNameForm
          channelNames={channels.map((ch) => ch.name)}
          onSubmit={handleAdd}
          onCancel={onClose}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AddModal;
