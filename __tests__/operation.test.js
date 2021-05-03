import makeAtomicOperation, { applyAtomic } from '../lib/atomicOperation.js';
import makeOperation, { transform, apply } from '../lib/operation.js';

const genRandInt = (from, to) => from + Math.floor((to - from) * Math.random());

const genRandString = (length) => {
  const symbols = 'qwertyuiopasdfghjklzxcvbnm1234567890';
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push(symbols[genRandInt(0, symbols.length)]);
  }

  return result.join('');
};

const chooseRandomly = (arr) => {
  const i = genRandInt(0, arr.length);
  return arr[i];
};

const iterationsCount = 10000;

const minStrLength = 10;
const maxStrLength = 15;
const types = ['insert', 'remove'];
const maxOperSize = 20;
const maxContentLength = 8;

const genRandOperation = (str) => {
  const operSize = genRandInt(0, maxOperSize);
  const atomicOperations = [];

  const genRandAtomicOperation = (type) => {
    if (type === 'insert') {
      const pos = genRandInt(0, str.length + 1);
      const contentLength = genRandInt(1, maxContentLength);
      const content = genRandString(contentLength);
      return makeAtomicOperation('insert', { pos, content });
    }

    if (type === 'remove') {
      const pos = genRandInt(0, str.length + 1);
      const length = genRandInt(1, str.length - pos + 1);
      return makeAtomicOperation('remove', { pos, length });
    }
  };

  for (let j = 0; j < operSize; j++) {
    const type = chooseRandomly(types);
    const newAtomicOperation = genRandAtomicOperation(type);
    atomicOperations.push(newAtomicOperation);
    str = applyAtomic(str, newAtomicOperation);
  }

  return makeOperation(...atomicOperations);
};

it('insert-insert-random', () => {
  for (let i = 0; i < iterationsCount; i++) {
    const length = genRandInt(minStrLength, maxStrLength + 1);
    const str = genRandString(length);
    const oper1 = genRandOperation(str);
    const oper2 = genRandOperation(str);

    // console.log('---------------');
    // console.log(str);
    // console.log(oper1.toString());
    // console.log(oper2.toString());
    const [oper1Transformed, oper2Transformed] = transform(oper1, oper2);
    // console.log(oper1Transformed.toString());
    // console.log(oper2Transformed.toString());
    expect(apply(apply(str, oper2), oper1Transformed)).toEqual(
      apply(apply(str, oper1), oper2Transformed),
    );
  }
});
