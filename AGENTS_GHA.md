# KILO CODE AGENT INSTRUCTIONS

## Your Context
You are running in a GitHub Action with:
- Full repo checked out
- `gh` CLI authenticated (use `GH_TOKEN`)
- Write access to push commits and manage PRs
- Working branch already checked out

## Task Format
Your prompt contains:
1. Issue or PR title and body
2. `TASK:` — the specific instruction from the triggering comment
3. Metadata: `ISSUE_NUMBER`, `BRANCH_NAME`, and optionally `PR_NUMBER`
4. `ISSUE COMMENTS:` — All comments on the issue (if applicable)
5. `PR COMMENTS:` — All comments on the PR (if applicable)
6. `CODE REVIEW COMMENTS (on current commit):` — Code review comments specifically on the current commit (if applicable)

## Workflow

### 1. Start
- Run `date` and record timestamp
- Plan work as small, committable steps

### 2. For Each Step

Make changes, then:

```
yarn format && yarn lint --diagnostic-level=error && yarn compile

git add . && git commit -m "[description]"

git push -u origin $BRANCH_NAME
```
Fix any issues before committing.

### 3. PR Management

Create PR if not exists

Push commits. Comment progress:

```
gh pr comment $PR_NUMBER --body "Progress update: ..."
```

**Work complete:**

```
gh pr comment $PR_NUMBER --body "Completed the requested changes. [details]"
```

```
gh pr ready $PR_NUMBER
```

If ISSUE_NUMBER provided, comment on the issue:

```
gh issue comment $ISSUE_NUMBER --body "Work completed. See PR #$PR_NUMBER."
```

### 4. Time Limit

Run `date` after each commit. Stop after 30 minutes elapsed.

## Repo Setup

This repository uses:

- Yarn PnP / Berry, with workspaces
  - NEVER run commands via npx
- Biome JS for format checking and linting
- Jests for testing

## Common Commands

The following commands should usually be executed on the project root:

- `yarn compile`
- `yarn format-check`
- `yarn format`
- `yarn lint`
- `yarn lint-fix`
- For fixing the linting for a particular file: `yarn biome lint [filePath] --write --unsafe`

## Coding

- Always assume methods you want to use are exported in the main module (e.g. don't use `import { getNotionToken } from 'notion-data/src/user/getNotionToken';`, instead use `import { getNotionToken } from 'notion-data';`)
- If a method has more than 2 arguments, always create a parameter interface type and object. Don't forget TSDoc style comments for every interface and property.
- When a new method is imported into a module, always add the import and call of the method in one edit operation.
- If multiple lines need to be changed in a file, do not use replace in file, instead write the whole file
- Define new methods by using function() rather than a new constant.
- If there are formatting issues, try to fix with `yarn format`

### Comments

- Do not delete comments, but update them if required.
- Do not add comments into the code describing what you have done. Instead, add comments when required to clarify logic
- provide TSDoc style message signatures. Do not forget to provide tsdoc style comments for interfaces, types and classes as well.

## Unit Tests

- Run tests via `yarn test` - run tests in the package directory and not the project root,
- When creating a unit test, unless otherwise specified, assume to use real objects/implementations as opposed to Jest mocks
