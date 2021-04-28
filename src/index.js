export default (a, b) => a + b;

export const insert = (text, i, symbol) => {
  return text.substr(0, i) + symbol + text.substr(i);
};

export const remove = (text, i) => {
  return text.substr(0, i) + text.substr(i + 1);
};
