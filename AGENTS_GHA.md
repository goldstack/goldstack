# REQUIRED WORKFLOW FOR KILO CODE AGENT (follow exactly)

## Information Provided by Workflow
The agent may receive the following information from the GitHub workflow:
- **ISSUE_NUMBER**: The GitHub issue number (e.g., 123).
- **ISSUE_TITLE**: Full title of the issue.
- **ISSUE_BODY**: Full description of the issue.
- **COMMENT_BODY**: The full text of the comment that triggered the workflow (including the /kilo command).
- **EXTRACTED_TASK**: The task description extracted from the comment after the /kilo or /kilocode command.
- **BRANCH_NAME**: Automatically set to `kilo-issue-{issue_number}`.
- **PR_NUMBER**: The GitHub PR number if a PR already exists for the issue (e.g., 456).
- **GITHUB_TOKEN**: Available for 'gh' CLI operations.

Use this information to understand the context and scope of the task.

## Before Starting
1. Run `date` and record the timestamp.
2. Read and understand AGENTS_GHA.md.
3. Break the task into small, incremental steps. Each step should represent a unit of work that can be committed without causing compilation issues or test failures.

## For Every Completed Step
1. Implement the changes for the step.
2. Run `yarn format && yarn lint && yarn compile` in the project root.
3. Fix any formatting, linting (error level only, use `biome --diagnostic-level=error`), or compilation issues.
4. Create a commit with a clear message. Prefix with "WIP:" if more work is needed.
5. Push to the remote branch immediately.
6. Run `date` and check elapsed time.
7. If more than 30 minutes have passed since the start, stop work.

## GitHub Workflow Integration
When working on tasks requiring code changes:
- Create or use branch `kilo-issue-{issue_number}`.
- If PR_NUMBER is provided, update the existing PR; otherwise, if a draft PR doesn't exist, create a new draft PR; otherwise, update the existing PR.
- Comment on the issue or PR (use PR if PR_NUMBER provided) with progress updates using the 'gh' CLI (GITHUB_TOKEN is available).
- Change a draft PR to ready for review, only if work is completed

## References
- Always consult AGENTS_GHA.md for all actions.