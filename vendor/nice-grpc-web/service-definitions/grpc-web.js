export function fromGrpcWebServiceDefinition(definition) {
  const result = {};

  for (const [key, value] of Object.entries(definition)) {
    if (key === 'serviceName') {
      continue;
    }

    const method = value;

    result[uncapitalize(key)] = {
      path: `/${definition.serviceName}/${key}`,
      requestStream: method.requestStream,
      responseStream: method.responseStream,
      requestDeserialize: method.requestType.deserializeBinary,
      requestSerialize: (value) => value.serializeBinary(),
      responseDeserialize: method.responseType.deserializeBinary,
      responseSerialize: (value) => value.serializeBinary(),
      options: {}
    };
  }

  return result;
}

export function isGrpcWebServiceDefinition(definition) {
  return 'prototype' in definition;
}

function uncapitalize(value) {
  if (value.length === 0) {
    return value;
  }

  return value[0].toLowerCase() + value.slice(1);
}
