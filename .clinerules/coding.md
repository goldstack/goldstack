- Always assume methods you want to use are exported in the main module.

e.g. don't use `import { getNotionToken } from 'notion-data/src/user/getNotionToken';`, instead use `import { getNotionToken } from 'notion-data';`

- If a method has more than 2 arguments, always create a parameter interface type and object.
- When a new method is imported into a module, always add the import and call of the method in one edit operation.
- Try to batch changes for single files together and apply them in one go (rather than splitting a task into multiple smaller changes)
- create React components by exporting a function
- This repo uses Yarn PnP
- The following commands can be executed in the relevant package folder or the project root:
  - yarn compile (preferred at project root)
  - yarn build
  - yarn test (preferred at package folder)