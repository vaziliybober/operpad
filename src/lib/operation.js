import makeAtomicOperation, {
  applyAtomic,
  transformAtomic,
  toStringAtomic,
} from './atomicOperation.js';

const makeOperation = (...aOperations) => aOperations;

export const composeOperations = (...operations) =>
  operations.reduce((acc, oper) => [...acc, ...oper], makeOperation());

export const apply = (str, oper) =>
  oper.reduce((acc, aOper) => applyAtomic(acc, aOper), str);

export const toStringOperation = (oper) => {
  const insideBrackets = oper
    .map((aOper) => `  ${toStringAtomic(aOper)}`)
    .join('\n');
  return `[\n${insideBrackets}\n]`;
};

export const transform = (oper1, oper2) => {
  const operations1 = oper1.map((aOper1) => makeOperation(aOper1));
  const operations2 = oper2.map((aOper2) => makeOperation(aOper2));

  for (let i1 = 0; i1 < operations1.length; i1++) {
    for (let i2 = 0; i2 < operations2.length; i2++) {
      const o1 = operations1[i1];
      const o2 = operations2[i2];
      if (o1.length === 1 && o2.length === 1) {
        const a1 = o1[0];
        const a2 = o2[0];
        const [a1Transformed, a2Transformed] = transformAtomic(a1, a2);
        operations1[i1] = a1Transformed;
        operations2[i2] = a2Transformed;
      } else {
        const [o1Transformed, o2Transformed] = transform(o1, o2);
        operations1[i1] = o1Transformed;
        operations2[i2] = o2Transformed;
      }
    }
  }

  const atomics1 = operations1.flat();
  const atomics2 = operations2.flat();

  return [makeOperation(...atomics1), makeOperation(...atomics2)];
};

export default makeOperation;
