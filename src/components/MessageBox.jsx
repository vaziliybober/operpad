import React, { useRef, useEffect } from 'react';

import useChannels from '../hooks/useChannels.js';
import useMessages from '../hooks/useMessages.js';

const MessageBox = (props) => {
  const { children } = props;
  const [messages] = useMessages();
  const [{ currentChannelId }] = useChannels();

  const MessageBoxRef = useRef();
  useEffect(() => {
    const div = MessageBoxRef.current;
    div.scrollTop = div.scrollHeight - div.clientHeight;
  }, [currentChannelId]);

  return (
    <div className="col h-100">
      <div className="d-flex flex-column h-100">
        <div
          id="messages-box"
          ref={MessageBoxRef}
          className="chat-messages overflow-auto mb-3"
        >
          {messages.map((message) => (
            <div className="text-break" key={message.id}>
              <b>{message.userName}</b>
              {`: ${message.text}`}
            </div>
          ))}
        </div>
        <div className="mt-auto">{children}</div>
      </div>
    </div>
  );
};

export default MessageBox;
