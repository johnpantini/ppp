import { grpc } from '../grpc-web/index.js';
import { AbortError, throwIfAborted } from '../../abort-controller-x.js';
import { AsyncSink } from '../utils/AsyncSink.js';
import { ClientError } from '../nice-grpc-common/client/ClientError.js';
import { Metadata } from '../nice-grpc-common/Metadata.js';
import { toGrpcWebMethodDefinition } from '../service-definitions/index.js';
import {
  convertMetadataFromGrpcWeb,
  convertMetadataToGrpcWeb
} from '../utils/convertMetadata.js';
import { isAsyncIterable } from '../utils/isAsyncIterable.js';

/** @internal */
export function createServerStreamingMethod(
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

  async function* serverStreamingMethod(request, options) {
    if (isAsyncIterable(request)) {
      throw new Error(
        'A middleware passed invalid request to next(): expected a single message for server streaming method'
      );
    }

    const {
      metadata = Metadata(),
      signal = new AbortController().signal,
      onHeader,
      onTrailer
    } = options;
    const sink = new AsyncSink();
    const client = grpc.client(grpcMethodDefinition, {
      host: channel.address,
      transport: channel.transport
    });

    client.onHeaders((headers) => {
      onHeader?.(convertMetadataFromGrpcWeb(headers));
    });
    client.onMessage((message) => {
      sink.write(message);
    });
    client.onEnd((code, message, trailers) => {
      onTrailer?.(convertMetadataFromGrpcWeb(trailers));

      if (code === grpc.Code.OK) {
        sink.end();
      } else {
        sink.error(new ClientError(definition.path, +code, message));
      }
    });
    client.start(convertMetadataToGrpcWeb(metadata));
    client.send({
      serializeBinary: () => definition.requestSerialize(request)
    });
    client.finishSend();

    const abortListener = () => {
      sink.error(new AbortError());
      client.close();
    };

    signal.addEventListener('abort', abortListener);

    try {
      yield* sink;
    } finally {
      signal.removeEventListener('abort', abortListener);
      throwIfAborted(signal);
    }
  }

  const method =
    middleware == null
      ? serverStreamingMethod
      : (request, options) =>
          middleware(
            {
              method: methodDescriptor,
              requestStream: false,
              request,
              responseStream: true,
              next: serverStreamingMethod
            },
            options
          );

  return (request, options) => {
    const iterable = method(request, {
      ...defaultOptions,
      ...options
    });
    const iterator = iterable[Symbol.asyncIterator]();

    return {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            const result = await iterator.next();

            if (result.done && result.value != null) {
              return await iterator.throw(
                new Error(
                  'A middleware returned a message, but expected to return void for server streaming method'
                )
              );
            }

            return result;
          },
          return() {
            return iterator.return();
          },
          throw(err) {
            return iterator.throw(err);
          }
        };
      }
    };
  };
}
