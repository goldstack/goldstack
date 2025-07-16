// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsj = require('ts-json-schema-generator');
import fs from 'fs';

export const run = (argv: string[]): void => {
  if (!fs.existsSync('schemas/')) {
    throw new Error('Ensure that directory schemas/ exists in project');
  }

  const generateSchema = (schemaFile: string, type: string): void => {
    const config = {
      // path: 'src/lib/types/*',
      tsconfig: 'tsconfig.generate.json',
      skipTypeCheck: true,
      type,
    };
    const outputPath = `schemas/${schemaFile}`;
    const schema = tsj.createGenerator(config).createSchema(config.type);
    const schemaString = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, schemaString);
  };

  let prefix = 'This';
  if (argv.length > 2) {
    prefix = argv[2];
  }

  generateSchema('deployment.schema.json', `${prefix}Deployment`);
  generateSchema('package.schema.json', `${prefix}Package`);
  generateSchema('package-configuration.schema.json', `${prefix}PackageConfiguration`);
  generateSchema('deployment-configuration.schema.json', `${prefix}DeploymentConfiguration`);
};
