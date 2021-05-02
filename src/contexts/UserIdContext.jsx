import React, { createContext, useContext } from 'react';

const UserIdContext = createContext();

export const UserIdProvider = ({ children, value }) => (
  <UserIdContext.Provider value={value}>{children}</UserIdContext.Provider>
);

export const useUserIdContext = () => useContext(UserIdContext);
