import { Metadata } from './metadata.js';
import { client } from './client.js';

export function unary(methodDescriptor, props) {
  if (methodDescriptor.responseStream) {
    throw new Error(
      '.unary cannot be used with server-streaming methods. Use .invoke or .client instead.'
    );
  }

  if (methodDescriptor.requestStream) {
    throw new Error(
      '.unary cannot be used with client-streaming methods. Use .client instead.'
    );
  }

  let responseHeaders = null;
  let responseMessage = null;
  // client can throw an error if the transport factory returns an error (e.g. no valid transport)
  const grpcClient = client(methodDescriptor, {
    host: props.host,
    transport: props.transport,
    debug: props.debug
  });

  grpcClient.onHeaders((headers) => {
    responseHeaders = headers;
  });
  grpcClient.onMessage((res) => {
    responseMessage = res;
  });
  grpcClient.onEnd((status, statusMessage, trailers) => {
    props.onEnd({
      status: status,
      statusMessage: statusMessage,
      headers: responseHeaders ? responseHeaders : new Metadata(),
      message: responseMessage,
      trailers: trailers
    });
  });
  grpcClient.start(props.metadata);
  grpcClient.send(props.request);
  grpcClient.finishSend();

  return {
    close: () => {
      grpcClient.close();
    }
  };
}
