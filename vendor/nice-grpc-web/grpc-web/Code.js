export var Code;
(function (Code) {
  Code[(Code['OK'] = 0)] = 'OK';
  Code[(Code['Canceled'] = 1)] = 'Canceled';
  Code[(Code['Unknown'] = 2)] = 'Unknown';
  Code[(Code['InvalidArgument'] = 3)] = 'InvalidArgument';
  Code[(Code['DeadlineExceeded'] = 4)] = 'DeadlineExceeded';
  Code[(Code['NotFound'] = 5)] = 'NotFound';
  Code[(Code['AlreadyExists'] = 6)] = 'AlreadyExists';
  Code[(Code['PermissionDenied'] = 7)] = 'PermissionDenied';
  Code[(Code['ResourceExhausted'] = 8)] = 'ResourceExhausted';
  Code[(Code['FailedPrecondition'] = 9)] = 'FailedPrecondition';
  Code[(Code['Aborted'] = 10)] = 'Aborted';
  Code[(Code['OutOfRange'] = 11)] = 'OutOfRange';
  Code[(Code['Unimplemented'] = 12)] = 'Unimplemented';
  Code[(Code['Internal'] = 13)] = 'Internal';
  Code[(Code['Unavailable'] = 14)] = 'Unavailable';
  Code[(Code['DataLoss'] = 15)] = 'DataLoss';
  Code[(Code['Unauthenticated'] = 16)] = 'Unauthenticated';
})(Code || (Code = {}));

export function httpStatusToCode(httpStatus) {
  switch (httpStatus) {
    case 0: // Connectivity issues
      return Code.Internal;
    case 200:
      return Code.OK;
    case 400:
      return Code.InvalidArgument;
    case 401:
      return Code.Unauthenticated;
    case 403:
      return Code.PermissionDenied;
    case 404:
      return Code.NotFound;
    case 409:
      return Code.Aborted;
    case 412:
      return Code.FailedPrecondition;
    case 429:
      return Code.ResourceExhausted;
    case 499:
      return Code.Canceled;
    case 500:
      return Code.Unknown;
    case 501:
      return Code.Unimplemented;
    case 503:
      return Code.Unavailable;
    case 504:
      return Code.DeadlineExceeded;
    default:
      return Code.Unknown;
  }
}
