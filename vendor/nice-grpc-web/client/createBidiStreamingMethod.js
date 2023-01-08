import { ClientError } from '../nice-grpc-common/client/ClientError.js';
import { Metadata } from '../nice-grpc-common/Metadata.js';
import { grpc } from '../grpc-web/index.js';
import {
  AbortError,
  isAbortError,
  throwIfAborted
} from '../../abort-controller-x.js';
import { AsyncSink } from '../utils/AsyncSink.js';
import { toGrpcWebMethodDefinition } from '../service-definitions/index.js';
import { isAsyncIterable } from '../utils/isAsyncIterable.js';
import {
  convertMetadataFromGrpcWeb,
  convertMetadataToGrpcWeb
} from '../utils/convertMetadata.js';

/** @internal */
export function createBidiStreamingMethod(
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

  async function* bidiStreamingMethod(request, options) {
    if (!isAsyncIterable(request)) {
      throw new Error(
        'A middleware passed invalid request to next(): expected a single message for bidirectional streaming method'
      );
    }

    const {
      metadata = Metadata(),
      signal = new AbortController().signal,
      onHeader,
      onTrailer
    } = options;
    const pipeAbortController = new AbortController();
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

    let pipeError;

    pipeRequest(pipeAbortController.signal, request, client, definition).then(
      () => {
        client.finishSend();
      },
      (err) => {
        if (!isAbortError(err)) {
          pipeError = err;
          client.close();
          sink.end();
        }
      }
    );

    const abortListener = () => {
      sink.error(new AbortError());
      pipeAbortController.abort();
      client.close();
    };

    signal.addEventListener('abort', abortListener);

    try {
      yield* sink;
    } finally {
      pipeAbortController.abort();
      signal.removeEventListener('abort', abortListener);
      throwIfAborted(signal);

      if (pipeError) {
        throw pipeError;
      }
    }
  }

  const method =
    middleware == null
      ? bidiStreamingMethod
      : (request, options) =>
          middleware(
            {
              method: methodDescriptor,
              requestStream: true,
              request,
              responseStream: true,
              next: bidiStreamingMethod
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
                  'A middleware returned a message, but expected to return void for bidirectional streaming method'
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

async function pipeRequest(signal, request, client, definition) {
  for await (const item of request) {
    throwIfAborted(signal);
    client.send({
      serializeBinary: () => definition.requestSerialize(item)
    });
  }
}
