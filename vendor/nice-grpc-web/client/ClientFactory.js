import { composeClientMiddleware } from '../nice-grpc-common/composeClientMiddleware.js';
import { normalizeServiceDefinition } from '../service-definitions/index.js';
import { createBidiStreamingMethod } from './createBidiStreamingMethod.js';
import { createClientStreamingMethod } from './createClientStreamingMethod.js';
import { createServerStreamingMethod } from './createServerStreamingMethod.js';
import { createUnaryMethod } from './createUnaryMethod.js';

export function createClientFactory() {
  return createClientFactoryWithMiddleware();
}

export function createClient(definition, channel, defaultCallOptions) {
  return createClientFactory().create(definition, channel, defaultCallOptions);
}

function createClientFactoryWithMiddleware(middleware) {
  return {
    use(newMiddleware) {
      return createClientFactoryWithMiddleware(
        middleware == null
          ? newMiddleware
          : composeClientMiddleware(middleware, newMiddleware)
      );
    },
    create(definition, channel, defaultCallOptions = {}) {
      const client = {};
      const methodEntries = Object.entries(
        normalizeServiceDefinition(definition)
      );

      for (const [methodName, methodDefinition] of methodEntries) {
        const defaultOptions = {
          ...defaultCallOptions['*'],
          ...defaultCallOptions[methodName]
        };

        if (!methodDefinition.requestStream) {
          if (!methodDefinition.responseStream) {
            client[methodName] = createUnaryMethod(
              methodDefinition,
              channel,
              middleware,
              defaultOptions
            );
          } else {
            client[methodName] = createServerStreamingMethod(
              methodDefinition,
              channel,
              middleware,
              defaultOptions
            );
          }
        } else {
          if (!methodDefinition.responseStream) {
            client[methodName] = createClientStreamingMethod(
              methodDefinition,
              channel,
              middleware,
              defaultOptions
            );
          } else {
            client[methodName] = createBidiStreamingMethod(
              methodDefinition,
              channel,
              middleware,
              defaultOptions
            );
          }
        }
      }

      return client;
    }
  };
}
