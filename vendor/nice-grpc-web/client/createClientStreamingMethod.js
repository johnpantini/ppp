import { ClientError } from '../nice-grpc-common/client/ClientError.js';
import { Metadata } from '../nice-grpc-common/Metadata.js';
import { grpc } from '../grpc-web/index.js';
import {
  execute,
  isAbortError,
  throwIfAborted
} from '../../abort-controller-x.js';
import { toGrpcWebMethodDefinition } from '../service-definitions/index.js';
import { isAsyncIterable } from '../utils/isAsyncIterable.js';
import {
  convertMetadataFromGrpcWeb,
  convertMetadataToGrpcWeb
} from '../utils/convertMetadata.js';

/** @internal */
export function createClientStreamingMethod(
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

  async function* clientStreamingMethod(request, options) {
    if (!isAsyncIterable(request)) {
      throw new Error(
        'A middleware passed invalid request to next(): expected a single message for client streaming method'
      );
    }

    const {
      metadata = Metadata(),
      signal = new AbortController().signal,
      onHeader,
      onTrailer
    } = options;

    return await execute(signal, (resolve, reject) => {
      const pipeAbortController = new AbortController();
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
        pipeAbortController.abort();

        if (code === grpc.Code.OK) {
          resolve(response);
        } else {
          reject(new ClientError(definition.path, +code, message));
        }
      });
      client.start(convertMetadataToGrpcWeb(metadata));
      pipeRequest(pipeAbortController.signal, request, client, definition).then(
        () => {
          client.finishSend();
        },
        (err) => {
          if (!isAbortError(err)) {
            reject(err);
            client.close();
          }
        }
      );

      return () => {
        pipeAbortController.abort();
        client.close();
      };
    });
  }

  const method =
    middleware == null
      ? clientStreamingMethod
      : (request, options) =>
          middleware(
            {
              method: methodDescriptor,
              requestStream: true,
              request,
              responseStream: false,
              next: clientStreamingMethod
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
            'A middleware yielded a message, but expected to only return a message for client streaming method'
          )
        );
        continue;
      }

      if (result.value == null) {
        result = await iterator.throw(
          new Error(
            'A middleware returned void, but expected to return a message for client streaming method'
          )
        );
        continue;
      }

      return result.value;
    }
  };
}

async function pipeRequest(signal, request, client, definition) {
  for await (const item of request) {
    throwIfAborted(signal);
    client.send({
      serializeBinary: () => definition.requestSerialize(item)
    });
  }
}
