const config = require('config');

const envName = config.util.getEnv('NODE_ENV');
const migrationConfig = {};

migrationConfig[envName] = {
  client: config.get('database.client'),
  connection: config.get('database.connection'),
};

console.log(`Running on ${envName} mode.`);

module.exports = migrationConfig;
