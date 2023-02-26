import { createServer } from 'http';
import mongodb from './vendor/mongodb.min.js';

(await import('./ppf.mjs')).default(mongodb, createServer);
