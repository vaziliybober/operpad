/* eslint-disable no-plusplus */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-loop-statement */

import { transformAtomic } from './atomicOperation.js';

export default class Operation {
  constructor(...atomicOperations) {
    this._atomicOperations = atomicOperations;
  }

  get atomicOperations() {
    return this._atomicOperations;
  }

  concatAtomic(atomicOperation) {
    return new Operation(...this.atomicOperations, atomicOperation);
  }

  concat(anotherOperation) {
    return new Operation(
      ...this.atomicOperations,
      ...anotherOperation.atomicOperations,
    );
  }

  apply(str) {
    return this.atomicOperations.reduce((acc, aOper) => aOper.apply(acc), str);
  }

  toString() {
    return this.atomicOperations.toString();
  }
}

export const transform = (oper1, oper2) => {
  const aOperations1 = [...oper1.atomicOperations];
  const aOperations2 = [...oper2.atomicOperations];

  for (let i1 = 0; i1 < aOperations1.length; i1++) {
    for (let i2 = 0; i2 < aOperations2.length; i2++) {
      const aOper1 = aOperations1[i1];
      const aOper2 = aOperations2[i2];
      const [aOper1Transformed, aOper2Transformed] = transformAtomic(
        aOper1,
        aOper2,
      );
      aOperations1[i1] = aOper1Transformed;
      aOperations2[i2] = aOper2Transformed;
    }
  }

  return [new Operation(...aOperations1), new Operation(...aOperations2)];
};