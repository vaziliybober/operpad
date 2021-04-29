#!/usr/bin/env node

import getApp from '../server/index.js';

const app = getApp();
app.get('/', () => 'Hello, world!');

app.listen(5000, () => console.log('Server up at localhost 5000'));
