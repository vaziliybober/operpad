import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import useOperations from '../hooks/useOperations.js';

const findSum = (numbers) => numbers.reduce((a, b) => a + b, 0);

const App = () => {
  const [operations, { addUserOperations }] = useOperations();

  const handleChange = (editor, change) => {
    if (change.origin === 'setValue') {
      return;
    }

    const { lines } = editor.doc.children[0];

    const pos =
      findSum(
        lines.slice(0, change.from.line).map((line) => line.text.length + 1),
      ) + change.from.ch;

    const { removed, text } = change;
    const somethingWasRemoved = !(removed.length === 1 && removed[0] === '');
    const somethingWasInserted = !(text.length === 1 && text[0] === '');

    const buildRemoveOperation = () => {
      const length =
        findSum(removed.map((r) => r.length)) + (removed.length - 1);
      return {
        type: 'remove',
        pos,
        length,
      };
    };

    const buildInsertOperation = () => {
      const content = text.join('\n');
      return {
        type: 'insert',
        pos,
        content,
      };
    };

    if (somethingWasRemoved && somethingWasInserted) {
      addUserOperations(buildRemoveOperation(), buildInsertOperation());
    } else if (somethingWasRemoved) {
      addUserOperations(buildRemoveOperation());
    } else if (somethingWasInserted) {
      addUserOperations(buildInsertOperation());
    } else {
      throw new Error('Nothing was removed or inserted!');
    }
  };

  console.log(operations);

  return (
    <>
      <h1 className="text-center">Operpad</h1>
      <div className="h-50 pb-3 border border-secondary">
        <CodeMirror
          value={'hello\nworld'}
          onChange={handleChange}
          options={{
            configureMouse: () => ({ addNew: false }),
          }}
        />
      </div>
    </>
  );
};

export default App;
