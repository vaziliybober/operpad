import React from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';

import useChannels from '../hooks/useChannels.js';
import useModals from '../hooks/useModals.js';

const Channels = () => {
  const [
    { channels, currentChannelId },
    { setCurrentChannelId },
  ] = useChannels();

  const [
    ,
    ,
    {
      chooseAddChannelsModal,
      chooseRemoveChannelsModal,
      chooseRenameChannelsModal,
    },
  ] = useModals();

  const getSwitchHandler = (id) => () => {
    setCurrentChannelId(id);
  };

  return (
    <>
      <div className="d-flex mb-2">
        <span>Channels</span>
        <Button
          onClick={chooseAddChannelsModal}
          variant="link"
          className="ml-auto p-0"
        >
          +
        </Button>
      </div>
      <ul className="nav flex-column nav-pills nav-fill">
        {channels.map(({ id, name, removable }) => {
          const variant = id === currentChannelId ? 'primary' : 'light';
          if (removable) {
            return (
              <li key={id} className="nav-item">
                <Dropdown>
                  <ButtonGroup className="d-flex mb-2 dropdown">
                    <Button
                      className="nav-link text-left flex-grow-1"
                      variant={variant}
                      onClick={getSwitchHandler(id)}
                    >
                      {name}
                    </Button>
                    <Dropdown.Toggle
                      aria-label="dropdown"
                      className="flex-grow-0"
                      variant={variant}
                    />
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          chooseRemoveChannelsModal(id);
                        }}
                      >
                        Remove
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          chooseRenameChannelsModal(id);
                        }}
                      >
                        Rename
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </ButtonGroup>
                </Dropdown>
              </li>
            );
          }
          return (
            <li key={id} className="nav-item">
              <Button
                onClick={getSwitchHandler(id)}
                variant={variant}
                className="btn-block nav-link text-left mb-2"
              >
                {name}
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Channels;
