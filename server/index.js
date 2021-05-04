import 'regenerator-runtime/runtime';
import path from 'path';
import Pug from 'pug';
import socketio from 'socket.io';
import fastify from 'fastify';
import pointOfView from 'point-of-view';
import fastifyStatic from 'fastify-static';
import _ from 'lodash';
import {
  composeOperations,
  transform,
  apply,
  toStringOperation,
} from './lib/operation.js';

const isProduction = process.env.NODE_ENV === 'production';

const setUpViews = (app) => {
  const domain = isProduction ? '' : 'http://localhost:8080';
  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    defaultContext: {
      assetPath: (filename) => `${domain}/assets/${filename}`,
    },
    templates: path.join(__dirname, 'views'),
  });
};

const setUpStaticAssets = (app) => {
  const pathPublic = isProduction
    ? path.join(__dirname, 'public')
    : path.join(__dirname, '..', 'dist', 'public');
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

const printRevisions = (revisions) => {
  revisions.forEach((rev, i) => {
    console.log('Revision', i, ':', rev.toString());
  });
};

export default () => {
  const app = fastify({ logger: false, prettyPrint: true });

  setUpViews(app);
  setUpStaticAssets(app);

  const io = socketio(app.server);

  const state = {
    text: '',
    revisions: [],
  };

  io.on('connection', (socket) => {
    socket.on('user-input', ({ operation, clientId, syncIndex }) => {
      const unsyncedRevisions = state.revisions.slice(syncIndex + 1);
      const serverOperation = composeOperations(...unsyncedRevisions);
      const [, transformedOperation] = transform(serverOperation, operation);
      state.revisions.push(transformedOperation);
      state.text = apply(state.text, transformedOperation);
      // console.log(state.text);

      io.emit('broadcast-operation', {
        operation: transformedOperation,
        clientId,
        revisionIndex: state.revisions.length - 1,
      });
    });
  });

  app.get('/', (_req, reply) => {
    reply.view('index.pug', {
      gon: {
        clientId: _.uniqueId(),
        text: state.text,
        syncIndex: state.revisions.length - 1,
      },
    });
  });

  return app;
};
