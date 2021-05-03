/* eslint-disable no-plusplus */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-loop-statement */

import AtomicOperation, { transformAtomic } from './atomicOperation.js';

export default class Operation {
  constructor(...atomicOperations) {
    this._atomicOperations = atomicOperations;
  }

  get atomicOperations() {
    return this._atomicOperations;
  }

  concatAtomic(...atomicOperations) {
    return new Operation(...this.atomicOperations, ...atomicOperations);
  }

  concat(anotherOperation) {
    return new Operation(
      ...this.atomicOperations,
      ...anotherOperation.atomicOperations,
    );
  }

  apply(str) {
    //console.log(this.toString());
    return this.atomicOperations.reduce((acc, aOper) => aOper.apply(acc), str);
  }

  toJSON() {
    return {
      atomicOperations: this.atomicOperations.map((aOper) => aOper.toJSON()),
    };
  }

  static fromJSON({ atomicOperations }) {
    return new Operation(
      ...atomicOperations.map((aOper) => AtomicOperation.fromJSON(aOper)),
    );
  }

  toString() {
    const content = this.atomicOperations
      .map((aOper) => `  ${aOper.toString()}`)
      .join('\n');
    return `[\n${content}\n]`;
  }
}

const inject = (arr1, i, arr2) => {
  return arr1
    .slice(0, i)
    .concat(arr2)
    .concat(arr1.slice(i + 1));
};

const printOp = (operations) => {
  console.log('[');
  console.log(operations.map((o) => `\t${o.toString()}`).join('\n'));
  console.log(']');
};

export const transform = (oper1, oper2) => {
  const operations1 = oper1.atomicOperations.map(
    (aOper1) => new Operation(aOper1),
  );
  const operations2 = oper2.atomicOperations.map(
    (aOper2) => new Operation(aOper2),
  );

  // printOp(operations1);
  // printOp(operations2);

  for (let i1 = 0; i1 < operations1.length; i1++) {
    for (let i2 = 0; i2 < operations2.length; i2++) {
      const o1 = operations1[i1];
      const o2 = operations2[i2];
      if (
        o1.atomicOperations.length === 1 &&
        o2.atomicOperations.length === 1
      ) {
        const a1 = o1.atomicOperations[0];
        const a2 = o2.atomicOperations[0];
        const [a1Transformed, a2Transformed] = transformAtomic(a1, a2);

        operations1[i1] = new Operation(...a1Transformed);
        operations2[i2] = new Operation(...a2Transformed);
      } else {
        const [o1Transformed, o2Transformed] = transform(o1, o2);
        operations1[i1] = o1Transformed;
        operations2[i2] = o2Transformed;
      }
      // console.log('-----------------');
      // console.log('i1:', i1, 'i2:', i2);
      // printOp(operations1);
      // printOp(operations2);
    }
  }

  const atomics1 = operations1.map((o1) => o1.atomicOperations).flat();
  const atomics2 = operations2.map((o2) => o2.atomicOperations).flat();

  return [new Operation(...atomics1), new Operation(...atomics2)];
};
