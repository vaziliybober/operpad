import React from 'react';
import CodeMirror from '@uiw/react-codemirror';

const App = () => (
  <>
    <h1 className="text-center">Operpad</h1>
    <div className="h-50 pb-3 border border-secondary">
      <CodeMirror />
    </div>
  </>
);

export default App;
