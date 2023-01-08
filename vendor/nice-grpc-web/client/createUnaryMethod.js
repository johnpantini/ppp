import { ClientError } from '../nice-grpc-common/client/ClientError.js';
import { Metadata } from '../nice-grpc-common/Metadata.js';
import { grpc } from '../grpc-web/index.js';
import { execute } from '../../abort-controller-x.js';
import { toGrpcWebMethodDefinition } from '../service-definitions/index.js';
import { isAsyncIterable } from '../utils/isAsyncIterable.js';
import {
  convertMetadataFromGrpcWeb,
  convertMetadataToGrpcWeb
} from '../utils/convertMetadata.js';

/** @internal */
export function createUnaryMethod(
  definition,
  channel,
  middleware,
  defaultOptions
) {
  const grpcMethodDefinition = toGrpcWebMethodDefinition(definition);
  const methodDescriptor = {
    path: definition.path,
    requestStream: definition.requestStream,
    responseStream: definition.responseStream,
    options: definition.options
  };

  async function* unaryMethod(request, options) {
    if (isAsyncIterable(request)) {
      throw new Error(
        'A middleware passed invalid request to next(): expected a single message for unary method'
      );
    }

    const {
      metadata = Metadata(),
      signal = new AbortController().signal,
      onHeader,
      onTrailer
    } = options;

    return await execute(signal, (resolve, reject) => {
      let response;
      const client = grpc.client(grpcMethodDefinition, {
        host: channel.address,
        transport: channel.transport
      });

      client.onHeaders((headers) => {
        onHeader?.(convertMetadataFromGrpcWeb(headers));
      });
      client.onMessage((message) => {
        response = message;
      });
      client.onEnd((code, message, trailers) => {
        onTrailer?.(convertMetadataFromGrpcWeb(trailers));

        if (code === grpc.Code.OK) {
          resolve(response);
        } else {
          reject(new ClientError(definition.path, +code, message));
        }
      });
      client.start(convertMetadataToGrpcWeb(metadata));
      client.send({
        serializeBinary: () => definition.requestSerialize(request)
      });
      client.finishSend();

      return () => {
        client.close();
      };
    });
  }

  const method =
    middleware == null
      ? unaryMethod
      : (request, options) =>
          middleware(
            {
              method: methodDescriptor,
              requestStream: false,
              request,
              responseStream: false,
              next: unaryMethod
            },
            options
          );

  return async (request, options) => {
    const iterable = method(request, {
      ...defaultOptions,
      ...options
    });
    const iterator = iterable[Symbol.asyncIterator]();
    let result = await iterator.next();

    while (true) {
      if (!result.done) {
        result = await iterator.throw(
          new Error(
            'A middleware yielded a message, but expected to only return a message for unary method'
          )
        );
        continue;
      }

      if (result.value == null) {
        result = await iterator.throw(
          new Error(
            'A middleware returned void, but expected to return a message for unary method'
          )
        );
        continue;
      }

      return result.value;
    }
  };
}
