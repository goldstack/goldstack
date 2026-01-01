## Repo Setup

This repository uses:

- Yarn PnP / Berry, with workspaces
- Biome JS for format checking and linting
- Jests for testing

## Coding

- Always assume methods you want to use are exported in the main module (e.g. don't use `import { getNotionToken } from 'notion-data/src/user/getNotionToken';`, instead use `import { getNotionToken } from 'notion-data';`)
- If a method has more than 2 arguments, always create a parameter interface type and object. Don't forget TSDoc style comments for every interface and property.
- When a new method is imported into a module, always add the import and call of the method in one edit operation.
- If multiple lines need to be changed in a file, do not use replace in file, instead write the whole file 
- Define new methods by using function() rather than a new constant.

### Comments

- Do not delete comments, but update them if required.
- Do not add comments into the code describing what you have done. Instead, add comments when required to clarify logic
- provide TSDoc style message signatures. Do not forget to provide tsdoc style comments for interfaces, types and classes as well.

## Unit Tests

- ONLY run test when I ask you OR when fixing a unit test or before pushing changes. Run tests via `yarn test` - run tests in the package directory and not the project root, unless I ask to run them in the project root.
- When creating a unit test, unless otherwise specified, assume to use real objects/implementations as opposed to Jest mocks

## Terraform

- To check Terraform plan, use `yarn infra plan [deploymentName]`
- To use arbitrary Terraform command, use `yarn infra terraform [deploymentName] [command]`. e.g `yarn infra terraform prod force-unlock -force [id]`
- Note we need to avoid user confirmations, so use `-force` when possible, otherwise warn the user