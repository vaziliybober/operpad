/* eslint-disable no-plusplus */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-loop-statement */
import AtomicOperation, { transformAtomic } from '../lib/atomicOperation.js';
import Operation, { transform } from '../lib/operation.js';

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

const genRandOperation = (str) => {
  const types = ['insert', 'remove', 'mixed', 'blank'];
  const operSize = genRandInt(1, 2);
  const atomicOperations = [];
  const genRandAtomicOperation = (type, depth = 0) => {
    if (type === 'blank') {
      return new AtomicOperation('blank');
    }

    if (type === 'mixed') {
      const normalTypes =
        depth === 0 ? ['remove', 'blank', 'mixed'] : ['remove', 'blank'];
      const t = chooseRandomly(normalTypes);
      const size = genRandInt(2, 3);
      const atomics = [];
      for (let i = 0; i < size; i++) {
        atomics.push(genRandAtomicOperation(t, depth + 1));
      }

      return new AtomicOperation('mixed', atomics);
    }

    if (type === 'insert') {
      const pos = genRandInt(0, str.length + 1);
      const contentLength = genRandInt(1, 6);
      const content = genRandString(contentLength);
      return new AtomicOperation('insert', { pos, content });
    }

    if (type === 'remove') {
      const pos = genRandInt(0, str.length + 1);
      const length = genRandInt(1, str.length - pos + 1);
      return new AtomicOperation('remove', { pos, length });
    }
  };
  for (let j = 0; j < operSize; j++) {
    const type = chooseRandomly(types);
    const newAtomicOperation = genRandAtomicOperation(type);
    atomicOperations.push(newAtomicOperation);
    str = newAtomicOperation.apply(str);
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
      new AtomicOperation('insert', { pos: 2, content: 'a' }),
      new AtomicOperation('insert', { pos: 3, content: 'b' }),
    ]);
  });

  it('delete-delete: 1left, 2right', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('remove', { pos: 1, length: 2 });
    const o2 = new AtomicOperation('remove', { pos: 5, length: 3 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('ade');
    expect(o2t.apply(o1.apply(str))).toEqual('ade');
  });

  it('delete-delete: 2left, 1right', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('remove', { pos: 5, length: 3 });
    const o2 = new AtomicOperation('remove', { pos: 1, length: 2 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('ade');
    expect(o2t.apply(o1.apply(str))).toEqual('ade');
  });

  it('delete-delete: 1 more left, 2 more right', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('remove', { pos: 1, length: 3 });
    const o2 = new AtomicOperation('remove', { pos: 2, length: 4 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('agh');
    expect(o2t.apply(o1.apply(str))).toEqual('agh');
  });

  it('delete-delete: 2 more left, 1 more right', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('remove', { pos: 2, length: 4 });
    const o2 = new AtomicOperation('remove', { pos: 1, length: 3 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('agh');
    expect(o2t.apply(o1.apply(str))).toEqual('agh');
  });

  it('delete-delete: 1 is bigger', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('remove', { pos: 1, length: 6 });
    const o2 = new AtomicOperation('remove', { pos: 3, length: 3 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('ah');
    expect(o2t.apply(o1.apply(str))).toEqual('ah');
  });

  it('insert-delete: left-right', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('insert', { pos: 1, content: '+-' });
    const o2 = new AtomicOperation('remove', { pos: 1, length: 3 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('a+-efgh');
    expect(o2t.apply(o1.apply(str))).toEqual('a+-efgh');
  });

  it('delete-insert: right-left', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('remove', { pos: 1, length: 3 });
    const o2 = new AtomicOperation('insert', { pos: 1, content: '+-' });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('a+-efgh');
    expect(o2t.apply(o1.apply(str))).toEqual('a+-efgh');
  });

  it('insert-delete: right-left', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('insert', { pos: 5, content: '+-' });
    const o2 = new AtomicOperation('remove', { pos: 1, length: 3 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('ae+-fgh');
    expect(o2t.apply(o1.apply(str))).toEqual('ae+-fgh');
  });

  it('delete-insert: right-left', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('remove', { pos: 1, length: 3 });
    const o2 = new AtomicOperation('insert', { pos: 5, content: '+-' });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('ae+-fgh');
    expect(o2t.apply(o1.apply(str))).toEqual('ae+-fgh');
  });

  it('insert-delete: insert between', () => {
    const str = 'abcdefgh';
    const o1 = new AtomicOperation('insert', { pos: 3, content: '+-' });
    const o2 = new AtomicOperation('remove', { pos: 1, length: 6 });
    const [o1t, o2t] = transformAtomic(o1, o2);
    expect(o1t.apply(o2.apply(str))).toEqual('a+-h');
    expect(o2t.apply(o1.apply(str))).toEqual('a+-h');
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
    const to12 = new AtomicOperation('insert', { pos: 3, content: '-' });
    const to1 = new Operation(to11, to12);

    const to21 = new AtomicOperation('insert', { pos: 4, content: '*' });
    const to22 = new AtomicOperation('insert', { pos: 5, content: '/' });
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

  it('delete-delete', () => {
    const str = 'abcdefghijklmnop';
    const o11 = new AtomicOperation('remove', { pos: 0, length: 10 });
    const o12 = new AtomicOperation('remove', { pos: 2, length: 2 });
    const o1 = new AtomicOperation('mixed', [o11, o12]);

    const o21 = new AtomicOperation('remove', { pos: 1, length: 4 });
    const o22 = new AtomicOperation('remove', { pos: 6, length: 3 });
    const o2 = new AtomicOperation('mixed', [o21, o22]);

    const [to1, to2] = transformAtomic(o1, o2);
    expect(to1.apply(o2.apply(str))).toEqual(to2.apply(o1.apply(str)));
  });

  it('delete-delete2', () => {
    const str = 'abcdefghijklmnop';
    const o11 = new AtomicOperation('remove', { pos: 3, length: 5 });
    const o12 = new AtomicOperation('insert', { pos: 2, content: 'ri' });
    const o13 = new AtomicOperation('remove', { pos: 3, length: 3 });
    const o14 = new AtomicOperation('remove', { pos: 2, length: 1 });
    const o1 = new Operation(o11, o12, o13, o14);

    const o21 = new AtomicOperation('insert', { pos: 0, content: '7uim' });
    const o22 = new AtomicOperation('insert', { pos: 7, content: 'fm' });
    const o23 = new AtomicOperation('insert', { pos: 7, content: 'yyzf0' });
    const o24 = new AtomicOperation('remove', { pos: 17, length: 1 });
    const o2 = new Operation(o21, o22, o23, o24);

    const [to1, to2] = transform(o1, o2);
    // console.log(to1.toString());
    // console.log(to2.toString());
    expect(to1.apply(o2.apply(str))).toEqual(to2.apply(o1.apply(str)));
  });

  it('insert-insert-random', () => {
    for (let i = 0; i < 10000; i++) {
      const length = genRandInt(5, 10);
      const str = genRandString(length);
      const oper1 = genRandOperation(str);
      const oper2 = genRandOperation(str);
      const [oper1Transformed, oper2Transformed] = transform(oper1, oper2);

      // console.log('---------------');
      // console.log(str);
      // console.log(oper1.toString());
      // console.log(oper2.toString());
      // console.log(oper1Transformed.toString());
      // console.log(oper2Transformed.toString());
      expect(oper1Transformed.apply(oper2.apply(str))).toEqual(
        oper2Transformed.apply(oper1.apply(str)),
      );
    }
  });
});
