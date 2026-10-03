# Maintenance Workflow

## 1. Start
- Run `date` and record the timestamp
- `git fetch origin master "$BRANCH_NAME" 2>/dev/null || git fetch origin master`
- **If `origin/$BRANCH_NAME` does not exist:** create a fresh branch from
  `master`. The workflow removes the branch when the previous pull request was
  merged or closed, so this is the normal path after an attempt landed.
  ```
  git checkout -b $BRANCH_NAME origin/master
  ```
  Then plan the remaining work as small, committable steps.
- **If `origin/$BRANCH_NAME` exists:** check it out and bring `master` in.
  ```
  git checkout $BRANCH_NAME
  git merge origin/master
  ```
  **Merge, never rebase.** The branch's commits are already pushed and the run
  pushes with a plain `git push`. Rebasing rewrites their SHAs, the push is
  rejected as `non-fast-forward`, and the work is lost. Resolve any conflicts,
  commit the merge, and carry on.
- Find the pull request, if there is one, and read its comments to understand
  what was already done and what remains:
  ```
  PR_NUMBER=$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number // empty')
  if [ -n "$PR_NUMBER" ]; then gh pr view "$PR_NUMBER" --comments; fi
  ```
- Plan remaining work as small, committable steps

## 2. For Each Step
Make changes, then run:
```
yarn format && yarn lint && yarn compile
git add . && git commit -m "[description]"
git push -u origin $BRANCH_NAME
```
Fix any issues before committing.

### No-Op Check
Before any commit, after the task-specific commands have run, check whether the task actually produced any changes. If there is no diff against `origin/master` and nothing uncommitted in the working tree, the task is a no-op and must NOT produce a PR or commit:

```
if git diff --quiet origin/master...HEAD && [ -z "$(git status --porcelain)" ]; then
  echo "No changes detected. Treating as no-op."

  PR_NUMBER=$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number // empty')
  if [ -n "$PR_NUMBER" ]; then
    gh pr comment "$PR_NUMBER" --body "Re-running this maintenance task detected no changes since the last run. Closing PR and removing branch."
    gh pr close "$PR_NUMBER" --delete-branch
    echo "Closed PR #$PR_NUMBER and deleted branch $BRANCH_NAME"
  fi

  git checkout master
  git branch -D "$BRANCH_NAME" 2>/dev/null || true
  exit 0
fi
```

Re-evaluate this check before every commit, so an empty commit is never produced.

## 3. PR Management
- If no PR exists yet, create one in **draft** mode so it stays out of the review queue until CI is green:
  ```
  gh pr create --draft --title "[Maintenance] $TASK_TITLE" --body "Automated maintenance task: $TASK_TITLE"
  ```
- Push commits to the branch
- Comment progress updates:
  ```
  gh pr comment $PR_NUMBER --body "Progress update: ..."
  ```
- IMPORTANT: One PR max per maintenance task. The branch name (`$BRANCH_NAME`) provided in the prompt identifies the task.

## 4. Monitor CI Build
After pushing changes to the PR branch:
- Wait for CI checks to start, then monitor with:
  ```
  gh pr checks $PR_NUMBER
  ```
- If any checks fail, fix the issues, commit, and push again
- Repeat until all checks pass or the time limit is reached
- **Before marking the PR ready**, re-merge `origin/master` into the branch to ensure no conflicts exist since work began:
  ```
  git fetch origin master && git merge origin/master
  ```
  - If there are conflicts, resolve them, commit, and push — then wait for CI checks to pass again
  - If the merge produces new commits, push them and wait for CI checks to pass again
  - Only proceed once the merge is clean (no conflicts and no new changes)
- **Preflight: confirm `master` is still integrated.** This must exit `0`:
  ```
  git merge-base --is-ancestor origin/master HEAD
  ```
  - It fails if `master` was never merged in, or if the history was rewritten
    (`git rebase`, `git commit --amend` of a pushed commit, `git reset --hard`
    over pushed commits). Re-merge `master` to fix it.
  - Never `git push --force` to rescue a rewrite: put the remote tip back into
    the history with
    `git fetch origin $BRANCH_NAME && git merge origin/$BRANCH_NAME` instead.
    The workflow republishes the branch after the run if a push was rejected.
- **Once all checks pass and the branch is cleanly up to date with master**, mark the PR ready for review:
  ```
  gh pr ready $PR_NUMBER
  gh pr comment $PR_NUMBER --body "All CI checks passed. Marking PR ready for review."
  ```

## 5. Time Limit
- Run `date` after each commit
- Stop after 30 minutes have elapsed since the start timestamp
- **If stopping due to timeout:** leave a PR comment summarizing what was completed and what remains:
  ```
  gh pr comment $PR_NUMBER --body "## Timeout reached

  ### Completed:
  - ...

  ### Remaining:
  - ..."
  ```
- **If work is complete:** leave a final PR comment stating all tasks are done:
  ```
  gh pr comment $PR_NUMBER --body "All maintenance tasks completed."
  ```
