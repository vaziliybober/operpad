import React from 'react';
import ot from '@vaziliybober/operlib';
import { diffChars } from 'diff';

const Editor = ({ text, onUserInput }) => {
  const [isUserInput, setIsUserInput] = React.useState(false);
  const cursor = React.useRef();
  const textareaRef = React.useRef();

  React.useEffect(() => {
    if (isUserInput) {
      setIsUserInput(false);
      return;
    }

    textareaRef.current.selectionStart = cursor.current;
    textareaRef.current.selectionEnd = cursor.current;
    console.log(cursor);
  }, [text]);

  const handleChange = (e) => {
    //console.log(text, e.target.value);
    // const diff = diffChars(text, e.target.value);
    //console.log(diff);
    // console.log(e.target.selectionStart, e.target.selectionEnd);
    // e.target.selectionStart -= 1;
    // e.target.selectionEnd -= 1;
    setIsUserInput(true);
    cursor.current = e.target.selectionStart;
    onUserInput(e.target.value);
  };

  return (
    <>
      <textarea
        ref={textareaRef}
        className="w-100"
        onClick={(e) => {
          cursor.current = e.target.selectionStart;
        }}
        onChange={handleChange}
        value={text}
      />
    </>
  );
};

export default Editor;
