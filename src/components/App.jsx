import React from 'react';
import CodeMirror from '@uiw/react-codemirror';

const findSum = (numbers) => numbers.reduce((a, b) => a + b, 0);

const App = () => {
  const handleChange = (editor, change) => {
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
      console.log('r+i');
      console.log(buildRemoveOperation());
      console.log(buildInsertOperation());
    } else if (somethingWasRemoved) {
      console.log('r');
      console.log(buildRemoveOperation());
    } else if (somethingWasInserted) {
      console.log('i');
      console.log(buildInsertOperation());
    } else {
      throw new Error('Nothing was removed or inserted!');
    }
  };
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
