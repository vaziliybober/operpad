import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModalContext = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [name, setName] = useState('');
  const [args, setArgs] = useState({});

  const closeModal = () => {
    setName('');
    setArgs({});
  };

  const chooseModal = (name_, args_ = {}) => {
    setName(name_);
    setArgs(args_);
  };

  const value = [
    name,
    args,
    {
      closeModal,
      chooseAddChannelsModal: () => chooseModal('addChannelModal'),
      chooseRemoveChannelsModal: (id) =>
        chooseModal('removeChannelModal', { removeId: id }),
      chooseRenameChannelsModal: (id) =>
        chooseModal('renameChannelModal', { renameId: id }),
    },
  ];

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
