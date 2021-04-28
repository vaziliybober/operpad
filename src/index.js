export default (a, b) => a + b;

export const insert = (text, i, symbol) =>
  text.substr(0, i) + symbol + text.substr(i);

export const remove = (text, i) => text.substr(0, i) + text.substr(i + 1);

const operationMap = {
  insert,
  remove,
};

export const apply = (o, text) => {
  const { type, i, symbol } = o;
  return operationMap[type](text, i, symbol);
};

export const transform = (text, o1, o2) => {
  const { type: type1, i: i1, symbol: symbol1 } = o1;
  const { type: type2, i: i2 } = o2;

  if (type1 === 'insert' && type2 === 'insert') {
    const i1_ = i1 <= i2 ? i1 : i1 + 1;

    return {
      type: 'insert',
      i: i1_,
      symbol: symbol1,
    };
  }

  throw new Error(`Unsupported types: ${type1}-${type2}`);
};
