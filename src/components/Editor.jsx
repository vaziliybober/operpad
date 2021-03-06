import React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror17';
import ot from '@vaziliybober/operlib';

const findSum = (numbers) => numbers.reduce((a, b) => a + b, 0);

const Editor = ({ text = '', disabled, onUserInput }) => {
  const handleChange = (editor, change) => {
    if (!change.origin) {
      return;
    }

    const { lines } = editor.doc.children[0];

    const pos =
      findSum(
        lines.slice(0, change.from.line).map((line) => line.text.length + 1),
      ) + change.from.ch;

    const { removed, text: inserted } = change;
    const somethingWasRemoved = !(removed.length === 1 && removed[0] === '');
    const somethingWasInserted = !(inserted.length === 1 && inserted[0] === '');

    const buildRemoveAtomic = () => {
      const length =
        findSum(removed.map((r) => r.length)) + (removed.length - 1);
      return ot.makeAtomic('remove', { pos, length });
    };

    const buildInsertAtomic = () => {
      const content = inserted.join('\n');
      return ot.makeAtomic('insert', { pos, content });
    };

    const buildOperation = () => {
      if (somethingWasRemoved && somethingWasInserted) {
        return ot.make(buildRemoveAtomic(), buildInsertAtomic());
      }
      if (somethingWasRemoved) {
        return ot.make(buildRemoveAtomic());
      }
      if (somethingWasInserted) {
        return ot.make(buildInsertAtomic());
      }
      throw new Error('Unexpected behaviour: Nothing was removed or inserted!');
    };

    const operation = buildOperation();

    if (onUserInput) {
      onUserInput(operation);
    }
  };

  return (
    <CodeMirror
      options={{
        configureMouse: () => ({ addNew: false }),
        readOnly: disabled,
      }}
      autoCursor={false}
      onChange={handleChange}
      value={text}
    />
  );
};

export default Editor;
