import { createServer } from 'http';

(await import('./ppf.mjs')).default(createServer);
