import makeOperation from './operation.js';

const insert = (str, pos, content) =>
  str.substr(0, pos) + content + str.substr(pos);

const remove = (str, pos, length = 1) =>
  str.substr(0, pos) + str.substr(pos + length);

const appliers = {
  insert: (str, { pos, content }) => insert(str, pos, content),
  remove: (str, { pos, length }) => remove(str, pos, length),
};

const makeAtomicOperation = (type, data) => ({ type, data });

export const applyAtomic = (str, aOper) => {
  const { type, data } = aOper;
  return appliers[type](str, data);
};

export const toStringAtomic = (aOper) => {
  const { type, data } = aOper;
  return `${type}: ${JSON.stringify(data)}`;
};

export const transformAtomic = (aOper1, aOper2) => {
  const useSymmetry = () => {
    const [aOper2Transformed, aOper1Transformed] = transformAtomic(
      aOper2,
      aOper1,
    );

    return [aOper1Transformed, aOper2Transformed];
  };

  if (aOper1.type === 'insert' && aOper2.type === 'insert') {
    const [pos1, pos2] =
      aOper1.data.pos <= aOper2.data.pos
        ? [aOper1.data.pos, aOper2.data.pos + aOper1.data.content.length]
        : [aOper1.data.pos + aOper2.data.content.length, aOper2.data.pos];

    return [
      makeOperation(
        makeAtomicOperation('insert', {
          pos: pos1,
          content: aOper1.data.content,
        }),
      ),
      makeOperation(
        makeAtomicOperation('insert', {
          pos: pos2,
          content: aOper2.data.content,
        }),
      ),
    ];
  }

  if (aOper1.type === 'remove' && aOper2.type === 'remove') {
    const left1 = aOper1.data.pos;
    const length1 = aOper1.data.length;
    const right1 = left1 + length1 - 1;

    const left2 = aOper2.data.pos;
    const length2 = aOper2.data.length;
    const right2 = left2 + length2 - 1;

    // aOper1 left, aOper2 right
    if (right1 < left2) {
      return [
        makeOperation(
          makeAtomicOperation('remove', {
            pos: left1,
            length: length1,
          }),
        ),
        makeOperation(
          makeAtomicOperation('remove', {
            pos: left2 - length1,
            length: length2,
          }),
        ),
      ];
    }

    // aOper2 left, aOper1 right
    if (right2 < left1) {
      return useSymmetry();
    }

    // aOper1 and aOper2 are intersected

    // aOper1 is more left, aOper2 is more right
    if (left1 <= left2 && right2 >= right1) {
      const intersectionLength = right1 - left2 + 1;
      return [
        makeOperation(
          makeAtomicOperation('remove', {
            pos: left1,
            length: length1 - intersectionLength,
          }),
        ),
        makeOperation(
          makeAtomicOperation('remove', {
            pos: right1 + 1 - length1,
            length: length2 - intersectionLength,
          }),
        ),
      ];
    }

    // aOper2 is more left, aOper1 is more right
    if (left2 <= left1 && right1 >= right2) {
      return useSymmetry();
    }

    // one is inside the other (and one is longer than the other)

    // aOper1 is bigger
    if (left1 <= left2 && right1 >= right2) {
      return [
        makeOperation(
          makeAtomicOperation('remove', {
            pos: left1,
            length: length1 - length2,
          }),
        ),
        [],
      ];
    }

    // aOper2 is bigger
    if (left2 <= left1 && right2 >= right1) {
      return useSymmetry();
    }

    throw new Error('Unexpected case, need to fix');
  }

  if (aOper1.type === 'insert' && aOper2.type === 'remove') {
    const left = aOper2.data.pos;
    const { length } = aOper2.data;
    const right = left + length - 1;
    const { pos } = aOper1.data;
    const { content } = aOper1.data;

    if (pos <= left) {
      return [
        makeOperation(
          makeAtomicOperation('insert', {
            pos,
            content,
          }),
        ),
        makeOperation(
          makeAtomicOperation('remove', {
            pos: left + content.length,
            length,
          }),
        ),
      ];
    }

    if (pos > right) {
      return [
        makeOperation(
          makeAtomicOperation('insert', {
            pos: pos - length,
            content,
          }),
        ),
        makeOperation(
          makeAtomicOperation('remove', {
            pos: left,
            length,
          }),
        ),
      ];
    }

    if (pos > left && pos <= right) {
      const leftPartLength = pos - left;
      const rightPartLength = length - leftPartLength;
      return [
        makeOperation(
          makeAtomicOperation('insert', {
            pos: left,
            content,
          }),
        ),
        makeOperation(
          makeAtomicOperation('remove', {
            pos: left,
            length: leftPartLength,
          }),
          makeAtomicOperation('remove', {
            pos: pos + content.length - leftPartLength,
            length: rightPartLength,
          }),
        ),
      ];
    }

    throw new Error('Unexpected case, need to fix');
  }

  if (aOper1.type === 'remove' && aOper2.type === 'insert') {
    return useSymmetry();
  }

  throw new Error(`Unsupported types: ${aOper1.type}-${aOper2.type}`);
};

export default makeAtomicOperation;
