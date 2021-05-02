export const insert = (text, pos, content) =>
  text.substr(0, pos) + content + text.substr(pos);

export const remove = (text, pos, length = 1) =>
  text.substr(0, pos) + text.substr(pos + length);

const oMap = {
  insert: (text, { pos, content }) => insert(text, pos, content),
  remove: (text, { pos, length }) => remove(text, pos, length),
};

export const apply = (o, text) => {
  const { type, data } = o;
  return oMap[type](text, data);
};

export const transform = (o, oAgainst, backwardPriority = false) => {
  if (o.type === 'insert' && oAgainst.type === 'insert') {
    // eslint-disable-next-line functional/no-let
    let pos;
    if (backwardPriority) {
      pos =
        o.data.pos <= oAgainst.data.pos
          ? o.data.pos
          : o.data.pos + oAgainst.data.content.length;
    } else {
      pos =
        o.data.pos < oAgainst.data.pos
          ? o.data.pos
          : o.data.pos + oAgainst.data.content.length;
    }

    return {
      type: 'insert',
      data: {
        pos,
        content: o.data.content,
      },
    };
  }

  throw new Error(`Unsupported types: ${o.type}-${oAgainst.type}`);
};
