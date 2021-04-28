import sum from '../src/index.js';
import { insert, remove } from '../src/index.js';

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
