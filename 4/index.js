export const insert = (text, pos, content) =>
  text.substr(0, pos) + content + text.substr(pos);

export const remove = (text, pos, length = 1) =>
  text.substr(0, pos) + text.substr(pos + length);

const operationMap = {
  insert: (text, { pos, content }) => insert(text, pos, content),
  remove: (text, { pos, length }) => remove(text, pos, length),
};

export const apply = (oper, text) => {
  const { type, data } = oper;
  return operationMap[type](text, data);
};

export const transform = (oper, against) => {
  if (oper.type === 'insert' && against.type === 'insert') {
    const pos =
      oper.data.pos <= against.data.pos
        ? oper.data.pos
        : oper.data.pos + against.data.content.length;

    return {
      type: 'insert',
      data: {
        pos,
        content: oper.data.content,
      },
    };
  }

  throw new Error(`Unsupported types: ${oper.type}-${against.type}`);
};
