import React from 'react';
import Channels from './Channels.jsx';
import MessageBox from './MessageBox.jsx';
import MessageForm from './MessageForm.jsx';
import ModalsManager from './ModalsManager.jsx';
import { ModalProvider } from '../contexts/ModalContext.jsx';

const App = () => (
  <ModalProvider>
    <div className="row h-100 pb-3">
      <div className="col-3 border-right">
        <Channels />
      </div>
      <MessageBox>
        <MessageForm />
      </MessageBox>
    </div>
    <ModalsManager />
  </ModalProvider>
);

export default App;
