import { insert, remove, transform, apply } from '../lib/index.js';

test('insert', () => {
  expect(insert('hello world!', 5, ', cruel')).toBe('hello, cruel world!');
  expect(insert('hello world!', 0, 'bye ')).toBe('bye hello world!');
});

test('remove', () => {
  expect(remove('hello, world!', 5)).toBe('hello world!');
  expect(remove('hello, world!', 0, 5)).toBe(', world!');
  expect(remove('hello, world!', 7, 6)).toBe('hello, ');
});

describe('apply', () => {
  it('insert', () => {
    const text = 'hello';
    const o = {
      type: 'insert',
      data: {
        pos: 5,
        content: '!!!',
      },
    };

    expect(apply(o, text)).toBe('hello!!!');
  });

  it('remove', () => {
    const text = 'hello';
    const o = {
      type: 'remove',
      data: {
        pos: 3,
        length: 2,
      },
    };

    expect(apply(o, text)).toBe('hel');
  });
});

describe('transform', () => {
  it('insert-insert', () => {
    const text = 'ХБР';
    const oper1 = {
      type: 'insert',
      data: {
        pos: 1,
        content: 'ААА',
      },
    };
    const oper2 = {
      type: 'insert',
      data: {
        pos: 3,
        content: '!!',
      },
    };

    const oper1t = transform(oper1, oper2);
    const oper2t = transform(oper2, oper1);

    expect(apply(oper1t, apply(oper2, text))).toBe('ХАААБР!!');
    expect(apply(oper2t, apply(oper1, text))).toBe('ХАААБР!!');
  });
});
