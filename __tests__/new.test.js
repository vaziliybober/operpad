/* eslint-disable no-plusplus */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-loop-statement */
import AtomicOperation, { transformAtomic } from '../lib/atomicOperation.js';
import Operation, { transform } from '../lib/operation.js';

const genRandInt = (from, to) => from + to * Math.random();

const genRandString = (length) => {
  const symbols = 'qwertyuiopasdfghjklzxcvbnm1234567890';
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push(symbols[genRandInt(0, symbols.length)]);
  }

  return result.join('');
};

const genRandOperation = (str) => {
  const operSize = genRandInt(0, 5);
  const atomicOperations = [];
  for (let j = 0; j < operSize; j++) {
    const pos = genRandInt(0, str.length + 1);
    const contentLength = genRandInt(1, 6);
    const content = genRandString(contentLength);
    const aOper = new AtomicOperation('insert', { pos, content });
    atomicOperations.push(aOper);
  }

  return new Operation(...atomicOperations);
};

describe('apply', () => {
  it('AtomicOperation.apply', () => {
    const o = new AtomicOperation('insert', { pos: 1, content: 'abc' });
    expect(o.apply('hello')).toEqual('habcello');
  });
  it('Operation.apply', () => {
    const o1 = new AtomicOperation('insert', { pos: 1, content: '+' });
    const o2 = new AtomicOperation('insert', { pos: 3, content: '-' });
    const o = new Operation(o1, o2);
    expect(o.apply('hello')).toEqual('h+e-llo');
  });
});

describe('transformAtomic', () => {
  it('insert-insert: multiple symbols', () => {
    const o1 = new AtomicOperation('insert', { pos: 1, content: 'abc' });
    const o2 = new AtomicOperation('insert', { pos: 2, content: 'xyz' });

    expect(transformAtomic(o1, o2)).toEqual([
      new AtomicOperation('insert', { pos: 1, content: 'abc' }),
      new AtomicOperation('insert', { pos: 5, content: 'xyz' }),
    ]);
  });

  it('insert-insert: equal pos', () => {
    const o1 = new AtomicOperation('insert', { pos: 2, content: 'a' });
    const o2 = new AtomicOperation('insert', { pos: 2, content: 'b' });

    expect(transformAtomic(o1, o2)).toEqual([
      new AtomicOperation('insert', { pos: 3, content: 'a' }),
      new AtomicOperation('insert', { pos: 2, content: 'b' }),
    ]);
  });
});

describe('transform', () => {
  it('insert-insert-1', () => {
    const o11 = new AtomicOperation('insert', { pos: 1, content: '+' });
    const o12 = new AtomicOperation('insert', { pos: 3, content: '-' });
    const o1 = new Operation(o11, o12);

    const o21 = new AtomicOperation('insert', { pos: 2, content: '*' });
    const o22 = new AtomicOperation('insert', { pos: 3, content: '/' });
    const o2 = new Operation(o21, o22);

    const to11 = new AtomicOperation('insert', { pos: 1, content: '+' });
    const to12 = new AtomicOperation('insert', { pos: 5, content: '-' });
    const to1 = new Operation(to11, to12);

    const to21 = new AtomicOperation('insert', { pos: 3, content: '*' });
    const to22 = new AtomicOperation('insert', { pos: 4, content: '/' });
    const to2 = new Operation(to21, to22);

    expect(transform(o1, o2)).toEqual([to1, to2]);
  });

  it('insert-insert-2', () => {
    const o11 = new AtomicOperation('insert', { pos: 1, content: '+' });
    const o12 = new AtomicOperation('insert', { pos: 2, content: '-' });
    const o1 = new Operation(o11, o12);

    const o21 = new AtomicOperation('insert', { pos: 2, content: '*' });
    const o22 = new AtomicOperation('insert', { pos: 3, content: '/' });
    const o2 = new Operation(o21, o22);

    const to11 = new AtomicOperation('insert', { pos: 1, content: '+' });
    const to12 = new AtomicOperation('insert', { pos: 2, content: '-' });
    const to1 = new Operation(to11, to12);

    const to21 = new AtomicOperation('insert', { pos: 4, content: '*' });
    const to22 = new AtomicOperation('insert', { pos: 5, content: '/' });
    const to2 = new Operation(to21, to22);

    expect(transform(o1, o2)).toEqual([to1, to2]);
  });

  it('insert-insert-random', () => {
    for (let i = 0; i < 1000; i++) {
      const length = genRandInt(5, 15);
      const str = genRandString(length);
      const oper1 = genRandOperation(str);
      const oper2 = genRandOperation(str);
      const [oper1Transformed, oper2Transformed] = transform(oper1, oper2);

      expect(oper1Transformed.apply(oper2.apply(str))).toEqual(
        oper2Transformed.apply(oper1.apply(str)),
      );
    }
  });
});