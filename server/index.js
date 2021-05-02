import 'regenerator-runtime/runtime';
import path from 'path';
import Pug from 'pug';
import Socket from 'socket.io';
import fastify from 'fastify';
import pointOfView from 'point-of-view';
import fastifyStatic from 'fastify-static';
import _ from 'lodash';
import { apply, transform } from '../lib/index.js';

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
    console.log('Revision', i, ':', rev);
  });
};

export default () => {
  const app = fastify({ logger: true, prettyPrint: true });

  setUpViews(app);
  setUpStaticAssets(app);

  const io = Socket(app.server);

  const state = { text: 'hello\nworld', revisions: [] };

  io.on('connection', (socket) => {
    socket.on('operation', (data) => {
      const { operation, syncedAt, userId } = data;
      const revisions = state.revisions.slice(syncedAt + 1);

      const transformedOperation = revisions
        .flat()
        .reduce((acc, revO) => acc.map((o) => transform(o, revO)), operation);

      // if (revisions.length > 0) {
      //   const a = operation[0];
      //   console.log(a);
      //   const b = revisions.flat()[0];
      //   console.log(b);
      //   console.log(transform(a, b));
      // }

      state.revisions.push(transformedOperation);

      io.emit('operation', {
        operation: transformedOperation,
        revisionIndex: state.revisions.length - 1,
        userId,
      });

      transformedOperation.forEach((o) => {
        state.text = apply(o, state.text);
      });

      console.log('---------------');
      console.log(state.text);
      printRevisions(state.revisions);
      console.log('---------------');
    });
  });

  app.get('/', (_req, reply) => {
    reply.view('index.pug', {
      gon: {
        text: state.text,
        syncedAt: state.revisions.length - 1,
        userId: _.uniqueId('user'),
      },
    });
  });

  return app;
};
