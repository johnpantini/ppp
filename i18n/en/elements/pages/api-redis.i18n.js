export default function (i18n) {
  i18n.extend({
    $apiRedisPage: {
      host: 'Host',
      hostDescription: 'The host to connect to.',
      enterAddress: 'Enter an address',
      secureConnection: 'Secure connection',
      port: 'Port',
      portDescription: 'The port to connect to.',
      database: 'Database',
      databaseDescription: 'The Redis database index to connect to.',
      username: 'Username',
      usernameDescription: 'The username to connect with.',
      password: 'Password',
      passwordDescription: 'The Redis password.',
      upstashZeroDbOnly:
        'Upstash only supports the database with index zero'
    }
  });
}
