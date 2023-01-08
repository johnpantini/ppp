import { BrowserHeaders } from '../../../vendor/browser-headers.js';
import * as impTransport from './transports/Transport.js';
import * as impTransportFetch from './transports/http/fetch.js';
import * as impTransportWebSocket from './transports/websocket/websocket.js';
import * as impTransportHttp from './transports/http/http.js';
import * as impCode from './Code.js';
import * as impInvoke from './invoke.js';
import * as impUnary from './unary.js';
import * as impClient from './client.js';

export var grpc;
(function (grpc) {
  grpc.setDefaultTransport = impTransport.setDefaultTransportFactory;
  grpc.CrossBrowserHttpTransport = impTransportHttp.CrossBrowserHttpTransport;
  grpc.FetchReadableStreamTransport =
    impTransportFetch.FetchReadableStreamTransport;
  grpc.WebsocketTransport = impTransportWebSocket.WebsocketTransport;
  grpc.Code = impCode.Code;
  grpc.Metadata = BrowserHeaders;

  function client(methodDescriptor, props) {
    return impClient.client(methodDescriptor, props);
  }

  grpc.client = client;
  grpc.invoke = impInvoke.invoke;
  grpc.unary = impUnary.unary;
})(grpc || (grpc = {}));
