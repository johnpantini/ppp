import {
  fromGrpcWebServiceDefinition,
  isGrpcWebServiceDefinition
} from './grpc-web.js';
import {
  fromTsProtoServiceDefinition,
  isTsProtoServiceDefinition
} from './ts-proto.js';

/** @internal */
export function normalizeServiceDefinition(definition) {
  if (isGrpcWebServiceDefinition(definition)) {
    return fromGrpcWebServiceDefinition(definition);
  } else if (isTsProtoServiceDefinition(definition)) {
    return fromTsProtoServiceDefinition(definition);
  } else {
    return definition;
  }
}

/** @internal */
export function toGrpcWebMethodDefinition(definition) {
  const [, serviceName, methodName] = definition.path.split('/');

  return {
    service: {
      serviceName
    },
    methodName,
    requestStream: definition.requestStream,
    responseStream: definition.responseStream,
    requestType: class {
      constructor() {
        throw new Error('Unexpected instantiation');
      }

      static deserializeBinary(bytes) {
        return definition.requestDeserialize(bytes);
      }
    },
    responseType: class {
      constructor() {
        throw new Error('Unexpected instantiation');
      }

      static deserializeBinary(bytes) {
        return definition.responseDeserialize(bytes);
      }
    }
  };
}
