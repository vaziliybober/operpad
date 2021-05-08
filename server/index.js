import 'regenerator-runtime/runtime';
import path from 'path';
import Pug from 'pug';
import fastify from 'fastify';
import pointOfView from 'point-of-view';
import fastifyStatic from 'fastify-static';
import _ from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import mongoose from 'mongoose';
import ot from '@vaziliybober/operlib';
import Document from './DocumentSchema.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/operpad';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

mongoose.connect(MONGODB_URI, options);

const DEFAULT_DATA_VALUE = '';

const findOrCreateDocument = async (id) => {
  const document = await Document.findById(id);
  if (document) {
    return document;
  }

  return Document.create({ _id: id, data: DEFAULT_DATA_VALUE });
};

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

const makeRevision = (operation, clientId, index) => ({
  operation,
  clientId,
  index,
});

export default () => {
  const app = fastify({ logger: true, prettyPrint: true });

  setUpViews(app);
  setUpStaticAssets(app);

  const documents = {};

  const printState = (documentId, state) => {
    console.log('documentId:', documentId);
    console.log('text:', state.text);
    state.revisions.forEach(({ operation, clientId, index }) => {
      console.log(`${index}. clientId: ${clientId}`);
      console.log(ot.toString(operation));
    });
    console.log('------------------');
  };

  app
    .get('/', (_req, reply) => {
      reply.redirect(`/documents/${uuidV4()}`);
    })
    .get('/demo', (req, reply) => {
      reply.redirect('/documents/demo');
    })
    .get('/documents/:documentId', async (req, reply) => {
      const { documentId } = req.params;
      if (!Object.keys(documents).includes(documentId)) {
        documents[documentId] = {
          text: (await findOrCreateDocument(documentId)).data,
          revisions: [],
        };
      }
      const state = documents[documentId];
      // console.log('state:', state);

      reply.view('index.pug', {
        gon: {
          clientId: _.uniqueId(),
          documentId,
          text: state.text,
          revisionIndex: state.revisions.length - 1,
        },
      });
    })
    .get(
      '/api/v1/newOperations/:documentId/:lastRevisionIndex',
      (req, reply) => {
        const { documentId } = req.params;
        const state = documents[documentId];
        if (!state) {
          reply.redirect(`/api/v1/documents/${documentId}`);
          return;
        }
        const lastRevisionIndex = Number(req.params.lastRevisionIndex);
        const lastRevisions = state.revisions.slice(lastRevisionIndex + 1);
        reply.send(lastRevisions);
      },
    )
    .post('/api/v1/userInput/:documentId', async (req, reply) => {
      const { documentId } = req.params;
      console.log(documentId);
      const state = documents[documentId];
      if (!state) {
        reply.redirect(`/api/v1/documents/${documentId}`);
        return;
      }
      const { operation, clientId, syncIndex } = req.body;
      const unsyncedRevisions = state.revisions.slice(syncIndex + 1);
      const serverOperation = ot.compose(
        ...unsyncedRevisions.map((rev) => rev.operation),
      );
      const [, transformedOperation] = ot.transform(serverOperation, operation);
      const newRevision = makeRevision(
        transformedOperation,
        clientId,
        state.revisions.length,
      );
      state.revisions.push(newRevision);
      state.text = ot.apply(state.text, transformedOperation);
      printState(documentId, state);
      Document.findByIdAndUpdate(documentId, { data: state.text }).exec();
      reply.code(201);
      reply.send();
    });

  return app;
};
