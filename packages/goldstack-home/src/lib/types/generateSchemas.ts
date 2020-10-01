import tsj from 'ts-json-schema-generator';
import fs from 'fs';

const generateSchema = (typeName: string, schemaFile: string): void => {
  const config = {
    path: 'src/lib/types/*',
    tsconfig: 'tsconfig.generate.json',
    type: typeName,
  };

  const outputPath = `src/lib/schemas/${schemaFile}`;

  const schema = tsj.createGenerator(config).createSchema(config.type);
  const schemaString = JSON.stringify(schema, null, 2);
  fs.writeFileSync(outputPath, schemaString);
};

generateSchema('ProjectFormType', 'projectForm.json');
generateSchema('AWSUserFormType', 'awsUserForm.json');
