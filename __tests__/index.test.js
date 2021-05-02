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
  it('insert-insert1', () => {
    const text = 'ХБР';
    const o1 = {
      type: 'insert',
      data: {
        pos: 1,
        content: 'ААА',
      },
    };
    const o2 = {
      type: 'insert',
      data: {
        pos: 3,
        content: '!!',
      },
    };

    const o1t = transform(o1, o2);
    const o2t = transform(o2, o1);

    expect(apply(o1t, apply(o2, text))).toBe('ХАААБР!!');
    expect(apply(o2t, apply(o1, text))).toBe('ХАААБР!!');
  });

  it('insert-insert2', () => {
    const text = 'hello';
    const o1 = {
      type: 'insert',
      data: {
        pos: 5,
        content: '1',
      },
    };
    const o2 = {
      type: 'insert',
      data: {
        pos: 5,
        content: '2',
      },
    };

    const o1t = transform(o1, o2);
    const o2t = transform(o2, o1);

    expect(apply(o1t, apply(o2, text))).toBe('hello21');
    expect(apply(o2t, apply(o1, text))).toBe('hello12');
  });
});
