import sum, { insert, remove, transform, apply } from '../src/index.js';

test('some test', () => {
  expect(sum(2, 2)).toBe(4);
});

test('insert', () => {
  expect(insert('hello world!', 5, ',')).toBe('hello, world!');
});

test('remove', () => {
  expect(remove('hello, world!', 5)).toBe('hello world!');
  expect(remove('hello, world!', 0)).toBe('ello, world!');
  expect(remove('hello, world!', 12)).toBe('hello, world');
});

describe('apply', () => {
  it('insert', () => {
    const text = 'hello';
    const o = {
      type: 'insert',
      i: 5,
      symbol: '!',
    };

    expect(apply(o, text)).toBe('hello!');
  });

  it('remove', () => {
    const text = 'hello';
    const o = {
      type: 'remove',
      i: 4,
    };

    expect(apply(o, text)).toBe('hell');
  });
});

describe('transform', () => {
  it('insert-insert', () => {
    const text0 = 'ХБР';
    const o1 = {
      type: 'insert',
      i: 1,
      symbol: 'А',
    };
    const o2 = {
      type: 'insert',
      i: 3,
      symbol: '!',
    };

    const o1_ = transform(text0, o1, o2);
    const o2_ = transform(text0, o2, o1);

    expect(apply(o1_, apply(o2, text0))).toBe('ХАБР!');
    expect(apply(o2_, apply(o1, text0))).toBe('ХАБР!');
  });
});
