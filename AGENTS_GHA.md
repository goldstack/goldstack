# REQUIRED WORKFLOW FOR KILO CODE AGENT (follow exactly)

## Information Provided by Workflow
The agent may receive the following information from the GitHub workflow:
- **Issue Number**: The GitHub issue number (e.g., 123).
- **Issue Title and Body**: Full title and description of the issue.
- **Comment Body**: The full text of the comment that triggered the workflow (including the /kilo command).
- **Extracted Task**: The task description extracted from the comment after the /kilo or /kilocode command.
- **Branch Name**: Automatically set to `kilo-issue-{issue_number}`.
- **GitHub Token**: Available for 'gh' CLI operations.

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
- Commit and push changes as per the steps above.
- If a draft PR doesn't exist, create one; otherwise, update the existing PR.
- Comment on the issue/PR with progress updates using the 'gh' CLI (GITHUB_TOKEN is available).
- Change a draft PR to ready for review, only if work is completed

## References
- Always consult AGENTS_GHA.md for all actions.