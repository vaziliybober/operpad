import React, { createContext, useContext } from 'react';

const SocketContext = createContext();

export const SocketProvider = ({ children, value }) => (
  <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
);

export const useSocketContext = () => useContext(SocketContext);
