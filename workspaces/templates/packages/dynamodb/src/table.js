'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getTableName =
  exports.stopAllLocalDynamoDB =
  exports.stopLocalDynamoDB =
  exports.startLocalDynamoDB =
  exports.migrateDownTo =
  exports.connectTable =
  exports.connect =
  exports.Entity =
  exports.DynamoDBClient =
    void 0;
const client_dynamodb_1 = require('@aws-sdk/client-dynamodb');
Object.defineProperty(exports, 'DynamoDBClient', {
  enumerable: true,
  get: function () {
    return client_dynamodb_1.DynamoDBClient;
  },
});
const lib_dynamodb_1 = require('@aws-sdk/lib-dynamodb');
const template_dynamodb_1 = require('@goldstack/template-dynamodb');
const goldstack_json_1 = __importDefault(require('./../goldstack.json'));
const package_schema_json_1 = __importDefault(require('./../schemas/package.schema.json'));
const entities_1 = require('./entities');
const migrations_1 = require('./migrations');
var dynamodb_toolbox_1 = require('dynamodb-toolbox');
Object.defineProperty(exports, 'Entity', {
  enumerable: true,
  get: function () {
    return dynamodb_toolbox_1.Entity;
  },
});
__exportStar(require('./entities'), exports);
/**
 * Connects to the DynamoDB table for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns {Promise<DynamoDBClient>} A promise that resolves with a DynamoDBClient instance.
 */
const connect = async (deploymentName) => {
  return await (0, template_dynamodb_1.connect)({
    goldstackConfig: goldstack_json_1.default,
    packageSchema: package_schema_json_1.default,
    deploymentName,
    migrations: (0, migrations_1.createMigrations)(),
  });
};
exports.connect = connect;
/**
 * Connects to the DynamoDB table and returns a Table instance for data operations.
 *
 * @param params - Optional parameters for connecting to the table.
 * @returns {Promise<Table>} A promise that resolves with a Table instance.
 */
const connectTable = async (params) => {
  const tableName = await (0, exports.getTableName)(
    params === null || params === void 0 ? void 0 : params.deploymentName,
  );
  if (params === null || params === void 0 ? void 0 : params.documentClient) {
    return (0, entities_1.createTable)(params.documentClient, tableName);
  }
  if (params === null || params === void 0 ? void 0 : params.client) {
    return (0, entities_1.createTable)(
      lib_dynamodb_1.DynamoDBDocumentClient.from(params.client),
      tableName,
    );
  }
  return (0, entities_1.createTable)(
    lib_dynamodb_1.DynamoDBDocument.from(
      await (0, exports.connect)(
        params === null || params === void 0 ? void 0 : params.deploymentName,
      ),
    ),
    tableName,
  );
};
exports.connectTable = connectTable;
/**
 * Migrates the DynamoDB table down to a specific migration.
 *
 * @param migrationName - The name of the migration to roll back to.
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns {Promise<DynamoDBClient>} A promise that resolves with a DynamoDBClient instance.
 */
const migrateDownTo = async (migrationName, deploymentName) => {
  return await (0, template_dynamodb_1.migrateDownTo)({
    migrationName,
    goldstackConfig: goldstack_json_1.default,
    packageSchema: package_schema_json_1.default,
    deploymentName,
    migrations: (0, migrations_1.createMigrations)(),
  });
};
exports.migrateDownTo = migrateDownTo;
/**
 * Starts a local DynamoDB instance for development and testing.
 *
 * @param portOrOptions - Optional port number or options object containing port, detached, and deploymentName.
 * @param deploymentName - Optional deployment name (only used if portOrOptions is a number).
 * @returns {Promise<void>} A promise that resolves when the local DynamoDB has started.
 *
 * @example
 * // Using new object parameter style
 * await startLocalDynamoDB({ port: 8000, detached: false });
 *
 * @example
 * // Using legacy positional parameter style
 * await startLocalDynamoDB(8000, 'local');
 */
const startLocalDynamoDB = async (portOrOptions, deploymentName) => {
  return await (0, template_dynamodb_1.startLocalDynamoDB)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    portOrOptions,
    deploymentName,
  );
};
exports.startLocalDynamoDB = startLocalDynamoDB;
/**
 * Stops a local DynamoDB instance.
 *
 * @param port - Optional port number of the local DynamoDB to stop.
 * @param deploymentName - Optional name of the deployment to use.
 * @returns {Promise<void>} A promise that resolves when the local DynamoDB has stopped.
 */
const stopLocalDynamoDB = async (port, deploymentName) => {
  return await (0, template_dynamodb_1.stopLocalDynamoDB)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    port,
    deploymentName,
  );
};
exports.stopLocalDynamoDB = stopLocalDynamoDB;
/**
 * Stops all local DynamoDB instances.
 *
 * @param deploymentName - Optional name of the deployment to use.
 * @returns {Promise<void>} A promise that resolves when all local DynamoDB instances have stopped.
 */
const stopAllLocalDynamoDB = async (deploymentName) => {
  return await (0, template_dynamodb_1.stopAllLocalDynamoDB)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deploymentName,
  );
};
exports.stopAllLocalDynamoDB = stopAllLocalDynamoDB;
/**
 * Gets the name of the DynamoDB table for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns {Promise<string>} A promise that resolves with the table name string.
 */
const getTableName = async (deploymentName) => {
  return await (0, template_dynamodb_1.getTableName)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deploymentName,
  );
};
exports.getTableName = getTableName;
//# sourceMappingURL=table.js.map
