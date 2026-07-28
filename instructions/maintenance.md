# Maintenance Workflow

## 1. Start
- Run `date` and record the timestamp
- Plan the work as small, committable steps

## 2. For Each Step
Make changes, then run:
```
yarn format && yarn lint && yarn compile
git add . && git commit -m "[description]"
git push -u origin $BRANCH_NAME
```
Fix any issues before committing.

## 3. PR Management
- Check if a PR already exists for the branch:
  ```
  gh pr list --head $BRANCH_NAME
  ```
- If no PR exists, create one:
  ```
  gh pr create --title "[Maintenance] $TASK_TITLE" --body "Automated maintenance task: $TASK_TITLE"
  ```
- Push commits to the branch
- Comment progress updates:
  ```
  gh pr comment $PR_NUMBER --body "Progress update: ..."
  ```
- IMPORTANT: One PR max per maintenance task. The branch name (`$BRANCH_NAME`) provided in the prompt identifies the task.

## 4. Time Limit
- Run `date` after each commit
- Stop after 30 minutes have elapsed since the start timestamp
