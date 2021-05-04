import React from 'react';
import 'codemirror/lib/codemirror.css';
import { UnControlled as CodeMirror } from 'react-codemirror17';
import makeAtomicOperation from '../../lib/atomicOperation.js';
import makeOperation from '../../lib/operation.js';

const CODE_MIRROR_CONFIG = {
  configureMouse: () => ({ addNew: false }),
};

const findSum = (numbers) => numbers.reduce((a, b) => a + b, 0);

const Editor = ({ text = '', onChange }) => {
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
      return makeAtomicOperation('remove', { pos, length });
    };

    const buildInsertAtomic = () => {
      const content = inserted.join('\n');
      return makeAtomicOperation('insert', { pos, content });
    };

    const buildOperation = () => {
      if (somethingWasRemoved && somethingWasInserted) {
        return makeOperation(buildRemoveAtomic(), buildInsertAtomic());
      }
      if (somethingWasRemoved) {
        return makeOperation(buildRemoveAtomic());
      }
      if (somethingWasInserted) {
        return makeOperation(buildInsertAtomic());
      }
      throw new Error('Unexpected behaviour: Nothing was removed or inserted!');
    };

    const operation = buildOperation();

    if (onChange) {
      onChange(operation);
    }
  };

  return (
    <CodeMirror
      options={CODE_MIRROR_CONFIG}
      autoCursor={false}
      onChange={handleChange}
      value={text}
    />
  );
};

export default Editor;
