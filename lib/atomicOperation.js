const insert = (text, pos, content) =>
  text.substr(0, pos) + content + text.substr(pos);

const remove = (text, pos, length = 1) =>
  text.substr(0, pos) + text.substr(pos + length);

const oMap = {
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

  toString() {
    return `AO (${this.type}) ${this.data}`;
  }
}

export const transformAtomic = (aOper1, aOper2) => {
  if (aOper1.type === 'insert' && aOper2.type === 'insert') {
    const [pos1, pos2] =
      aOper1.data.pos < aOper2.data.pos
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

  throw new Error(`Unsupported types: ${aOper1.type}-${aOper2.type}`);
};
