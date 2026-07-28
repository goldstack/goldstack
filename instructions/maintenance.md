# Maintenance Workflow

## 1. Start
- Run `date` and record the timestamp
- Check if a PR already exists for the branch:
  ```
  gh pr list --head $BRANCH_NAME
  ```
- **If a PR exists:**
  - Checkout and pull the latest:
    ```
    git checkout $BRANCH_NAME && git pull origin $BRANCH_NAME
    ```
  - Read PR comments to understand what was already done and what remains:
    ```
    gh pr view $PR_NUMBER --comments
    ```
- **If no PR exists:**
  - Create the branch:
    ```
    git checkout -b $BRANCH_NAME
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

## 3. PR Management
- If no PR exists yet, create one:
  ```
  gh pr create --title "[Maintenance] $TASK_TITLE" --body "Automated maintenance task: $TASK_TITLE"
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
