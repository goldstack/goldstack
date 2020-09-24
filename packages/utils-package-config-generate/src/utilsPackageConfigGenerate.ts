// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsj = require('ts-json-schema-generator');
import fs from 'fs';

const generateSchema = (schemaFile: string, type: string): void => {
  const config = {
    path: 'src/lib/types/*',
    tsconfig: 'tsconfig.generate.json',
    type,
  };
  const outputPath = `schemas/${schemaFile}`;
  const schema = tsj.createGenerator(config).createSchema(config.type);
  const schemaString = JSON.stringify(schema, null, 2);
  fs.writeFileSync(outputPath, schemaString);
};

let prefix = 'This';
if (process.argv.length > 2) {
  prefix = process.argv[2];
}

generateSchema('deployment.schema.json', `${prefix}Deployment`);
generateSchema('package.schema.json', `${prefix}Package`);
generateSchema(
  'package-configuration.schema.json',
  `${prefix}PackageConfiguration`
);
generateSchema(
  'deployment-configuration.schema.json',
  `${prefix}DeploymentConfiguration`
);
