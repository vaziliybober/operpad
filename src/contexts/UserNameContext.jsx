import React, { createContext, useContext } from 'react';

const UserNameContext = createContext();
export const UserNameProvider = ({ children, value }) => (
  <UserNameContext.Provider value={value}>{children}</UserNameContext.Provider>
);
export const useUserNameContext = () => useContext(UserNameContext);
