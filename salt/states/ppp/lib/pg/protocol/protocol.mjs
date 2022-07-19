export let Protocol;

(function (Protocol) {
  Protocol.VERSION_MAJOR = 3;
  Protocol.VERSION_MINOR = 0;

  // https://www.postgresql.org/docs/9.3/protocol-message-formats.html
  let BackendMessageCode;

  (function (BackendMessageCode) {
    BackendMessageCode[(BackendMessageCode['Authentication'] = 82)] =
      'Authentication';
    BackendMessageCode[(BackendMessageCode['BackendKeyData'] = 75)] =
      'BackendKeyData';
    BackendMessageCode[(BackendMessageCode['BindComplete'] = 50)] =
      'BindComplete';
    BackendMessageCode[(BackendMessageCode['CloseComplete'] = 51)] =
      'CloseComplete';
    BackendMessageCode[(BackendMessageCode['CommandComplete'] = 67)] =
      'CommandComplete';
    BackendMessageCode[(BackendMessageCode['CopyData'] = 100)] = 'CopyData';
    BackendMessageCode[(BackendMessageCode['CopyDone'] = 99)] = 'CopyDone';
    BackendMessageCode[(BackendMessageCode['CopyInResponse'] = 103)] =
      'CopyInResponse';
    BackendMessageCode[(BackendMessageCode['CopyOutResponse'] = 72)] =
      'CopyOutResponse';
    BackendMessageCode[(BackendMessageCode['CopyBothResponse'] = 87)] =
      'CopyBothResponse';
    BackendMessageCode[(BackendMessageCode['DataRow'] = 68)] = 'DataRow';
    BackendMessageCode[(BackendMessageCode['EmptyQueryResponse'] = 73)] =
      'EmptyQueryResponse';
    BackendMessageCode[(BackendMessageCode['ErrorResponse'] = 69)] =
      'ErrorResponse';
    BackendMessageCode[(BackendMessageCode['FunctionCallResponse'] = 86)] =
      'FunctionCallResponse';
    BackendMessageCode[(BackendMessageCode['NegotiateProtocolVersion'] = 118)] =
      'NegotiateProtocolVersion';
    BackendMessageCode[(BackendMessageCode['NoData'] = 110)] = 'NoData';
    BackendMessageCode[(BackendMessageCode['NoticeResponse'] = 78)] =
      'NoticeResponse';
    BackendMessageCode[(BackendMessageCode['NotificationResponse'] = 65)] =
      'NotificationResponse';
    BackendMessageCode[(BackendMessageCode['ParameterDescription'] = 116)] =
      'ParameterDescription';
    BackendMessageCode[(BackendMessageCode['ParameterStatus'] = 83)] =
      'ParameterStatus';
    BackendMessageCode[(BackendMessageCode['ParseComplete'] = 49)] =
      'ParseComplete';
    BackendMessageCode[(BackendMessageCode['PortalSuspended'] = 115)] =
      'PortalSuspended';
    BackendMessageCode[(BackendMessageCode['ReadyForQuery'] = 90)] =
      'ReadyForQuery';
    BackendMessageCode[(BackendMessageCode['RowDescription'] = 84)] =
      'RowDescription'; // T
  })(
    (BackendMessageCode =
      Protocol.BackendMessageCode || (Protocol.BackendMessageCode = {}))
  );

  let FrontendMessageCode;

  (function (FrontendMessageCode) {
    FrontendMessageCode[(FrontendMessageCode['Bind'] = 66)] = 'Bind';
    FrontendMessageCode[(FrontendMessageCode['Close'] = 67)] = 'Close';
    FrontendMessageCode[(FrontendMessageCode['CopyData'] = 100)] = 'CopyData';
    FrontendMessageCode[(FrontendMessageCode['CopyDone'] = 99)] = 'CopyDone';
    FrontendMessageCode[(FrontendMessageCode['CopyFail'] = 102)] = 'CopyFail';
    FrontendMessageCode[(FrontendMessageCode['Describe'] = 68)] = 'Describe';
    FrontendMessageCode[(FrontendMessageCode['Execute'] = 69)] = 'Execute';
    FrontendMessageCode[(FrontendMessageCode['Flush'] = 72)] = 'Flush';
    FrontendMessageCode[(FrontendMessageCode['FunctionCall'] = 70)] =
      'FunctionCall';
    FrontendMessageCode[(FrontendMessageCode['Parse'] = 80)] = 'Parse';
    FrontendMessageCode[(FrontendMessageCode['PasswordMessage'] = 112)] =
      'PasswordMessage';
    FrontendMessageCode[(FrontendMessageCode['Query'] = 81)] = 'Query';
    FrontendMessageCode[(FrontendMessageCode['Sync'] = 83)] = 'Sync';
    FrontendMessageCode[(FrontendMessageCode['Terminate'] = 88)] = 'Terminate'; // X
  })(
    (FrontendMessageCode =
      Protocol.FrontendMessageCode || (Protocol.FrontendMessageCode = {}))
  );

  let AuthenticationMessageKind;

  (function (AuthenticationMessageKind) {
    AuthenticationMessageKind['KerberosV5'] = 'KerberosV5';
    AuthenticationMessageKind['CleartextPassword'] = 'CleartextPassword';
    AuthenticationMessageKind['MD5Password'] = 'MD5Password';
    AuthenticationMessageKind['SCMCredential'] = 'SCMCredential';
    AuthenticationMessageKind['GSS'] = 'GSS';
    AuthenticationMessageKind['SSPI'] = 'SSPI';
    AuthenticationMessageKind['GSSContinue'] = 'GSSContinue';
    AuthenticationMessageKind['SASL'] = 'SASL';
    AuthenticationMessageKind['SASLContinue'] = 'SASLContinue';
    AuthenticationMessageKind['SASLFinal'] = 'SASLFinal';
  })(
    (AuthenticationMessageKind =
      Protocol.AuthenticationMessageKind ||
      (Protocol.AuthenticationMessageKind = {}))
  );

  let DataFormat;

  (function (DataFormat) {
    DataFormat[(DataFormat['text'] = 0)] = 'text';
    DataFormat[(DataFormat['binary'] = 1)] = 'binary';
  })((DataFormat = Protocol.DataFormat || (Protocol.DataFormat = {})));
})(Protocol || (Protocol = {}));
