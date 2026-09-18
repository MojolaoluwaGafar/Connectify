import compression from 'compression';
import cors from 'cors';
import express, { type RequestHandler } from 'express';
import helmetImport from 'helmet';

// helmet's own type declarations describe its ESM shape even under the CJS
// `require` condition. Depending on the exact TS/resolver combination (this
// reproduces under `moduleResolution: NodeNext` but not in every
// environment — it surfaced on Vercel's build, not locally, until forced),
// that mismatch makes TS infer the import as the whole module namespace
// object instead of the callable default export. The runtime value is
// correct regardless (confirmed against helmet's actual CJS output), so
// this asserts past the bad upstream type rather than working around it.
const helmet = helmetImport as unknown as (
  options?: Record<string, unknown>,
) => RequestHandler;

import { env } from './config/env.js';
import { errorHandler } from './http/error-handler.js';
import { rateLimiter } from './http/middleware/rate-limiter.js';
import { requestLogger } from './http/middleware/request-logger.js';
import { notFoundHandler } from './http/not-found-handler.js';
import { requestContext } from './http/request-context.js';
import { v1Router } from './routes/v1.js';
import { conversationsRouter } from './modules/conversations/conversations.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  // Shrinks JSON responses before they go over the wire — the biggest,
  // cheapest win for users on slow or expensive mobile data.
  app.use(compression());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '8mb' }));
  app.use(requestContext);
  app.use(rateLimiter({ windowMs: 60_000, maxRequests: 120 }));
  app.use(requestLogger);

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });
  app.use('/api/v1/conversations', conversationsRouter);

  app.use('/api/v1', v1Router);
  app.use('/v1', v1Router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
