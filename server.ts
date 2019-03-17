import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';
import { Request, Server } from 'hapi';
import { ngHapiEngine } from '@nguniversal/hapi-engine';
import * as Inert from 'inert';
// // Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';


// import * as express from 'express';
// import {join} from 'path';

// // Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// // * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP,
} = require('./dist/server/main');
const helloworld = require('raw-loader!./dist/browser/index.html');

const server = new Server({
  port: 3000,
  host: 'localhost',
});

server.route({
  method: 'GET',
  path: '/favicon.ico',
  handler: () => '',
});

server.route({
  method: 'GET',
  path: '/{path*}',
  handler: (req: Request) =>
    ngHapiEngine({
      req,
      bootstrap: AppServerModuleNgFactory,
      providers: [provideModuleMap(LAZY_MODULE_MAP)],
      document: helloworld,
    }),
});

const init = async () => {
  await server.register(Inert);
  server.route({
    method: 'GET',
    path: '/browser/{file*}',
    handler: {
      directory: {
        path: 'dist/browser',
      },
    },
  });
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
