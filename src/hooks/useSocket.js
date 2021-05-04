import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default (setup) => {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const sock = io();
    setSocket(sock);
    const cleanup = setup(sock);

    return () => {
      if (cleanup) {
        cleanup();
      }
      sock.disconnect();
    };
  }, []);

  return socket;
};
