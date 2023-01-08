import { client } from './client.js';

export function invoke(methodDescriptor, props) {
  if (methodDescriptor.requestStream) {
    throw new Error(
      '.invoke cannot be used with client-streaming methods. Use .client instead.'
    );
  }

  // client can throw an error if the transport factory returns an error (e.g. no valid transport)
  const grpcClient = client(methodDescriptor, {
    host: props.host,
    transport: props.transport,
    debug: props.debug
  });

  if (props.onHeaders) {
    grpcClient.onHeaders(props.onHeaders);
  }

  if (props.onMessage) {
    grpcClient.onMessage(props.onMessage);
  }

  if (props.onEnd) {
    grpcClient.onEnd(props.onEnd);
  }

  grpcClient.start(props.metadata);
  grpcClient.send(props.request);
  grpcClient.finishSend();

  return {
    close: () => {
      grpcClient.close();
    }
  };
}
