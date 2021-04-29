// @ts-check

const buildState = (defaultState) => defaultState;

export default (app, io, defaultState = {}) => {
  const state = buildState(defaultState);

  app.get('/', (_req, reply) => {
    reply.view('index.pug', { gon: state });
  });
};
