## Repo Setup

This repository uses:

- Yarn PnP / Berry, with workspaces
  - NEVER run commands via npx
- Biome JS for format checking and linting
- Jests for testing
- Agent sessions are never shared. `opencode.json` sets `share: "disabled"`, which
  makes OpenCode refuse to publish a session at all. The
  `anomalyco/opencode/github` action must keep its `share: false` input alongside
  that: the action checks its own input first, and without it the action tries to
  share, fails with `Sharing is disabled in configuration`, and dies before doing any
  work.

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
- Define new methods by using function() rather than a new constant.
- If there are formatting issues, try to fix with `yarn format`

### Comments

- Do not delete comments, but update them if required.
- Do not add comments into the code describing what you have done. Instead, add comments when required to clarify logic
- provide TSDoc style message signatures. Do not forget to provide tsdoc style comments for interfaces, types and classes as well.

## Unit Tests

- ONLY run test when I ask you OR when fixing a unit test or before pushing changes. Run tests via `yarn test` - run tests in the package directory and not the project root, unless I ask to run them in the project root.
- When creating a unit test, unless otherwise specified, assume to use real objects/implementations as opposed to Jest mocks

## Git

### Bring master in with a merge, not a rebase

```
git fetch origin master && git merge origin/master
```

Resolve each conflict, `git add` the resolved files, then `git commit`. If
`git merge` stops to ask about an unresolved path, `git add` it and commit
rather than aborting the merge and starting over.

This is the default for every branch, including a maintenance agent's own. A
merge keeps the remote tip an ancestor of `HEAD`, so the run's final push is a
fast-forward and nothing is rejected.

### Never rewrite history on a pushed branch

Once a commit is on the remote, treat its SHA as permanent. This means no
`git rebase`, no `git commit --amend` of an already-pushed commit, no
`git reset --hard` over pushed commits, no `git filter-branch`, and never
`git push --force` (or `--force-with-lease`). Amending and rebasing are only
safe for commits that have not been pushed yet.

This is not a style preference. Automated agent runs push with a plain
`git push` once the turn ends. A rewritten commit gets a new SHA, so the remote
tip is no longer an ancestor of `HEAD`, the push is rejected with
`non-fast-forward`, and the whole run fails after all the work is done.

### Recover if you already rewrote history

Do not start the task over. A merge commit puts the remote tip back into the
history, which makes the plain push a fast-forward again:

```
git fetch origin $BRANCH_NAME && git merge origin/$BRANCH_NAME
```

If that reports conflicts, resolve them and commit as described above.

### Push your own work before finishing an automated run

In a GitHub Actions run there is nobody to approve a push, and an unpushed
branch means the work is lost when the runner is torn down. When `GITHUB_ACTIONS`
is `true`, commit and push before you write your final response:

```
git add -A && git commit -m "[description]"
git push -u origin HEAD
```

Skip this in a local session, where pushing still needs explicit approval. If the
push is rejected, do not force it: the workflow republishes the branch after the
run, so a fast-forward merge of the remote tip is enough to leave things clean.
The agent never runs `git push --force` or `--force-with-lease`.

### Preflight before you finish

This must exit `0` before you write your final response, or `master` is not
integrated and the branch is not pushable:

```
git merge-base --is-ancestor origin/master HEAD
```

If it fails, re-merge `master`. It also fails after a rebase, which is the case
the rule above exists to prevent.

## Dev Sessions & Worktrees

- You may or may not be running inside a git worktree. Detect this with:
  `git rev-parse --git-dir` and `git rev-parse --git-common-dir` - if the
  two differ, you are in a linked worktree.
- When in a worktree: all edits and commits happen **here in the worktree**
  on its checked-out branch. Never switch branches, never modify the primary
  checkout or the base branch.
- Commit early and often with clear conventional commit messages.
- Pushing, renaming branches, and opening pull requests require my explicit
  approval. When approved:
  - Rename the branch to something descriptive derived from the actual
    changes (e.g. `fix/login-timeout`), unless it already has a good name.
  - Push with `git push -u origin HEAD`.
  - Open a pull request against the default branch:
    - if `origin` points at github.com, use `gh pr create`
    - if `origin` points at our Gitea server (cooler), use
      `tea pr create` (see instructions/custom for server specifics)
