const {
  AgentProtocol,
  BaseAgent,
  createAgent,
  OpenSSHAgent
} = require('./agent.js');
const {
  SSHTTPAgent: HTTPAgent,
  SSHTTPSAgent: HTTPSAgent
} = require('./http-agents.js');
const { parseKey } = require('./protocol/key-parser.js');
const {
  flagsToString,
  OPEN_MODE,
  STATUS_CODE,
  stringToFlags
} = require('./protocol/sftp.js');

module.exports = {
  AgentProtocol,
  BaseAgent,
  createAgent,
  Client: require('./client.js'),
  HTTPAgent,
  HTTPSAgent,
  OpenSSHAgent,
  utils: {
    parseKey,
    sftp: {
      flagsToString,
      OPEN_MODE,
      STATUS_CODE,
      stringToFlags
    }
  }
};
