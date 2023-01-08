import { grpc } from '../grpc-web/index.js';
import { Metadata } from '../nice-grpc-common/Metadata.js';
import { Base64 } from '../../../vendor/base64.min.js';

export function convertMetadataToGrpcWeb(metadata) {
  const grpcMetadata = new grpc.Metadata();

  for (const [key, values] of metadata) {
    for (const value of values) {
      grpcMetadata.append(
        key,
        typeof value === 'string' ? value : Base64.fromUint8Array(value)
      );
    }
  }

  return grpcMetadata;
}

export function convertMetadataFromGrpcWeb(grpcMetadata) {
  const metadata = Metadata();

  for (const [key, values] of Object.entries(grpcMetadata.headersMap)) {
    if (key.endsWith('-bin')) {
      for (const value of values) {
        for (const item of value.split(/,\s?/)) {
          metadata.append(key, Base64.toUint8Array(item));
        }
      }
    } else {
      metadata.set(key, values);
    }
  }

  return metadata;
}
