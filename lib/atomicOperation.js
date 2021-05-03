const insert = (text, pos, content) =>
  text.substr(0, pos) + content + text.substr(pos);

const remove = (text, pos, length = 1) =>
  text.substr(0, pos) + text.substr(pos + length);

const oMap = {
  blank: (text) => text,
  insert: (text, { pos, content }) => insert(text, pos, content),
  remove: (text, { pos, length }) => remove(text, pos, length),
};

export default class AtomicOperation {
  constructor(type, data) {
    this._type = type;
    this._data = data;
  }

  get type() {
    return this._type;
  }

  get data() {
    return this._data;
  }

  apply(str) {
    const { type, data } = this;
    return oMap[type](str, data);
  }

  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }

  static fromJSON({ type, data }) {
    return new AtomicOperation(type, data);
  }

  toString() {
    return `AO (${this.type}) ${JSON.stringify(this.data)}`;
  }
}

export const transformAtomic = (aOper1, aOper2) => {
  if (aOper1.type === 'blank') {
    return [
      new AtomicOperation('blank'),
      new AtomicOperation(aOper2.type, { ...aOper2.data }),
    ];
  }

  if (aOper2.type === 'blank') {
    return [
      new AtomicOperation(aOper1.type, { ...aOper1.data }),
      new AtomicOperation('blank'),
    ];
  }

  if (aOper1.type === 'insert' && aOper2.type === 'insert') {
    const [pos1, pos2] =
      aOper1.data.pos <= aOper2.data.pos
        ? [aOper1.data.pos, aOper2.data.pos + aOper1.data.content.length]
        : [aOper1.data.pos + aOper2.data.content.length, aOper2.data.pos];

    return [
      new AtomicOperation('insert', {
        pos: pos1,
        content: aOper1.data.content,
      }),
      new AtomicOperation('insert', {
        pos: pos2,
        content: aOper2.data.content,
      }),
    ];
  }
  if (aOper1.type === 'remove' && aOper2.type === 'remove') {
    const left1 = aOper1.data.pos;
    const length1 = aOper1.data.length;
    const right1 = left1 + length1 - 1;

    const left2 = aOper2.data.pos;
    const length2 = aOper2.data.length;
    const right2 = left2 + length2 - 1;

    // aOper1 left, aOper2 right
    if (right1 < left2) {
      return [
        new AtomicOperation('remove', {
          pos: left1,
          length: length1,
        }),
        new AtomicOperation('remove', {
          pos: left2 - length1,
          length: length2,
        }),
      ];
    }

    // aOper2 left, aOper1 right
    if (right2 < left1) {
      return [
        new AtomicOperation('remove', {
          pos: left1 - length2,
          length: length1,
        }),
        new AtomicOperation('remove', {
          pos: left2,
          length: length2,
        }),
      ];
    }

    // aOper1 and aOper2 are intersected

    // aOper1 is more left, aOper2 is more right
    if (left1 <= left2 && right2 >= right1) {
      const intersectionLength = right1 - left2 + 1;
      return [
        new AtomicOperation('remove', {
          pos: left1,
          length: length1 - intersectionLength,
        }),
        new AtomicOperation('remove', {
          pos: right1 + 1 - length1,
          length: length2 - intersectionLength,
        }),
      ];
    }

    // aOper2 is more left, aOper1 is more right
    if (left2 <= left1 && right1 >= right2) {
      const intersectionLength = right2 - left1 + 1;
      return [
        new AtomicOperation('remove', {
          pos: right2 + 1 - length2,
          length: length1 - intersectionLength,
        }),
        new AtomicOperation('remove', {
          pos: left2,
          length: length2 - intersectionLength,
        }),
      ];
    }

    // one is inside the other (and one is longer than the other)

    // aOper1 is bigger
    if (left1 <= left2 && right1 >= right2) {
      return [
        new AtomicOperation('remove', {
          pos: left1,
          length: length1 - length2,
        }),
        new AtomicOperation('blank'),
      ];
    }

    // aOper2 is bigger
    if (left2 <= left1 && right2 >= right1) {
      return [
        new AtomicOperation('blank'),
        new AtomicOperation('remove', {
          pos: left2,
          length: length2 - length1,
        }),
      ];
    }

    throw new Error('Unexpected case, need to fix');
  }

  throw new Error(`Unsupported types: ${aOper1.type}-${aOper2.type}`);
};
