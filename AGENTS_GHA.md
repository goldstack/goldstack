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

**A PR always exists (created in draft mode if needed).**

Push commits. Comment progress:

```
gh pr comment $PR_NUMBER --body "Progress update: ..."
```

If ISSUE_NUMBER provided, comment on the issue:

```
gh issue comment $ISSUE_NUMBER --body "Work in progress. See PR #$PR_NUMBER."
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