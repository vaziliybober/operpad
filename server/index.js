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

const makeRevision = (operation, clientId, index) => {
  return { operation, clientId, index };
};

export default () => {
  const app = fastify({ logger: false, prettyPrint: true });

  setUpViews(app);
  setUpStaticAssets(app);

  const state = {
    text: '',
    revisions: [],
  };

  const printState = () => {
    console.log('text:', state.text);
    state.revisions.forEach(({ operation, clientId, index }) => {
      console.log(`${index}. clientId: ${clientId}`);
      console.log(toStringOperation(operation));
    });
    console.log('------------------');
  };

  app
    .get('/', (_req, reply) => {
      reply.view('index.pug', {
        gon: {
          clientId: _.uniqueId(),
          text: state.text,
          revisionIndex: state.revisions.length - 1,
        },
      });
    })
    .get('/api/v1/newOperations/:lastRevisionIndex', (req, reply) => {
      const lastRevisionIndex = Number(req.params.lastRevisionIndex);
      const lastRevisions = state.revisions.slice(lastRevisionIndex + 1);
      reply.send(lastRevisions);
    })
    .post('/api/v1/userInput', (req, reply) => {
      const { operation, clientId, syncIndex } = req.body;
      const unsyncedRevisions = state.revisions.slice(syncIndex + 1);
      const serverOperation = composeOperations(
        ...unsyncedRevisions.map((rev) => rev.operation),
      );
      const [, transformedOperation] = transform(serverOperation, operation);
      const newRevision = makeRevision(
        transformedOperation,
        clientId,
        state.revisions.length,
      );
      state.revisions.push(newRevision);
      state.text = apply(state.text, transformedOperation);
      printState();
      reply.code(201);
      reply.send();
    });

  return app;
};
