# Maintenance Workflow

## 1. Start
- Run `date` and record the timestamp
- `git fetch origin master "$BRANCH_NAME" 2>/dev/null || git fetch origin master`
- **If `origin/$BRANCH_NAME` does not exist:**
  - Create a fresh branch from `master`:
    ```
    git checkout -b $BRANCH_NAME origin/master
    ```
  - Skip the rest of this section and plan the remaining work as small,
    committable steps.
- **If `origin/$BRANCH_NAME` exists:** always check it out first, then bring
  `master` in and judge whether that is still worth building on.
  ```
  git checkout $BRANCH_NAME
  gh pr list --head $BRANCH_NAME --json state --jq '.[0].state // "none"'
  git merge origin/master
  ```
  **Merge, never rebase.** This branch's commits are already pushed and the run
  pushes with a plain `git push`. Rebasing rewrites their SHAs, the push is
  rejected as `non-fast-forward`, and the work is lost.

  Now decide: keep merging, or reset. Use [Reset The Branch](#reset-the-branch)
  only when one of its triggers fires. Otherwise resolve the conflicts, commit
  the merge, and carry on.
- Read PR comments to understand what was already done and what remains:
  ```
  gh pr view $PR_NUMBER --comments
  ```
- Plan remaining work as small, committable steps

### Reset The Branch

An abandoned maintenance branch often diverges from `master` so far that merging
is no longer the cheaper option — most obviously when a previous run's partial
work conflicts with the files this task has to change. In that case discard the
branch entirely and rebuild it from `master`. Nothing else in the workflow is
lost: the PR stays open and this run recreates its diff.

Reset when **any** of these hold:

- The PR is `merged` or `closed` — the previous attempt already landed or was
  abandoned, so its commits must not be carried forward.
- The merge conflicts **and** either a conflicting path is one this task has to
  edit, or more than 3 paths conflict. Measure both before deciding:
  ```
  git diff --name-only --diff-filter=U
  ```
- The branch is both more than 20 commits behind `master` and older than 7 days:
  ```
  git rev-list --count HEAD..origin/master
  git log -1 --format=%cs origin/$BRANCH_NAME
  ```

Abort the merge first, then reset local **and** remote:

```
git merge --abort
git fetch origin master
git reset --hard origin/master
git push --force-with-lease="refs/heads/$BRANCH_NAME:$(git rev-parse "origin/$BRANCH_NAME")" \
  origin "HEAD:refs/heads/$BRANCH_NAME"
```

That fetch pulls `master` only, and **must not** also fetch `$BRANCH_NAME`.
`origin/$BRANCH_NAME` is the tip as of this run's checkout — the branch state
the decision above was based on. Fetching the branch here would refresh that ref
to whatever the branch is *now*, the lease would pin to it, and the push would
succeed while discarding a push made during the run. That is exactly what the
lease exists to prevent.

Then say so on the PR, so a reviewer sees why the earlier commits went away
instead of finding an unexplained truncation. Set `$REASON` to the trigger that
fired:

```
RESET_PR=$(gh pr list --head "$BRANCH_NAME" --json number,state --jq '.[0] | select(.state == "open") | .number // empty')
if [ -n "$RESET_PR" ]; then
  gh pr comment "$RESET_PR" --body "Reset \`$BRANCH_NAME\` to \`master\` and restarted the task from there: the previous attempt was $REASON."
fi
```

A `merged` or `closed` PR has nothing to comment on, which is why this looks the
PR up by state rather than reusing `$PR_NUMBER`.

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
    over pushed commits). Re-merge `master`, or apply
    [Reset The Branch](#reset-the-branch) if the branch is no longer worth
    building on.
  - `git push --force` and `--force-with-lease` are for the reset in
    [Reset The Branch](#reset-the-branch) only. Never use them to rescue a
    rewrite made by mistake — put the remote tip back into the history with
    `git fetch origin $BRANCH_NAME && git merge origin/$BRANCH_NAME` instead.
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
