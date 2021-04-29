import React from 'react';

import AddChannelModal from './AddChannelModal.jsx';
import RemoveChannelModal from './RemoveChannelModal.jsx';
import RenameChannelModal from './RenameChannelModal.jsx';
import useModals from '../hooks/useModals.js';

const ModalsManager = () => {
  const [name, args, { closeModal }] = useModals();

  return (
    <>
      <AddChannelModal
        show={name === 'addChannelModal'}
        onClose={closeModal}
        args={args}
      />
      <RemoveChannelModal
        show={name === 'removeChannelModal'}
        onClose={closeModal}
        args={args}
      />
      <RenameChannelModal
        show={name === 'renameChannelModal'}
        onClose={closeModal}
        args={args}
      />
    </>
  );
};

export default ModalsManager;
