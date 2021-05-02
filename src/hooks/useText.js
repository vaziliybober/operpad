import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { actions } from '../slices/index.js';

export default (initialText) => {
  const dispatch = useDispatch();
  const text = useSelector((state) => state.text);
  const setText = (newText) => dispatch(actions.setText({ text: newText }));
  useEffect(() => {
    setText(initialText);
  }, []);
  return [text, setText];
};
