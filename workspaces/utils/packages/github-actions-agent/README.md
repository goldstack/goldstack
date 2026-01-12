# GitHub Actions Agent CLI

[![npm version](https://badge.fury.io/js/@goldstack%2Futils-gha-agent.svg)](https://badge.fury.io/js/@goldstack%2Futils-gha-agent)

GitHub Actions Agent CLI for automating issue/PR workflows. Extracts and exposes functions from the kilocode workflow for use via API or CLI.

## Installation

```bash
npm install @goldstack/utils-gha-agent
```

## Environment Variables

The following environment variables are required:

- `GITHUB_TOKEN` - GitHub PAT token
- `KILOCODE_API_KEY` - Kilo Code API key

## CLI Usage

```bash
export GITHUB_TOKEN=your_token
export KILOCODE_API_KEY=your_kilo_key

gha-agent <command> [options]
```

### Commands

#### identify-comment

Extract issue and PR numbers from a comment event.

```bash
gha-agent identify-comment --comment "/kilo fix the bug" --issue-number 123
```

#### identify-branch

Identify the working branch based on issue/PR context.

```bash
gha-agent identify-branch --issue-number 123 --pr-number 456
```

#### checkout-branch

Checkout the appropriate working branch.

```bash
gha-agent checkout-branch --branch-name kilo-issue-123 --pr-number 456
```

#### build-context

Build comprehensive task context from issue/PR and comments.

```bash
gha-agent build-context \
  --comment "/kilo fix the bug" \
  --issue-number 123 \
  --pr-number 456
```

#### post-start

Post a started working comment to issue or PR.

```bash
gha-agent post-start \
  --issue-number 123 \
  --pr-number 456 \
  --branch-name kilo-issue-123 \
  --run-url "https://github.com/owner/repo/actions/runs/123"
```

#### fix-pr-body

Fix literal `\n` strings in PR body to actual newlines.

```bash
gha-agent fix-pr-body --pr-number 456
```

#### create-pr

Create a draft PR from the current branch.

```bash
gha-agent create-pr --issue-number 123 --branch-name kilo-issue-123
```

#### run-kilocode

Execute the Kilo Code agent with task context.

```bash
gha-agent run-kilocode --task "Fix the bug" --auto --timeout 2000
```

#### run-all

Execute the complete workflow as a single command.

```bash
gha-agent run-all \
  --comment "/kilo fix the bug" \
  --issue-number 123 \
  --auto \
  --timeout 2000
```

## Programmatic Usage

```typescript
import { GitHubActionsAgent } from '@goldstack/utils-gha-agent';

const agent = new GitHubActionsAgent({
  token: process.env.GITHUB_TOKEN!,
  kiloApiKey: process.env.KILOCODE_API_KEY!,
});

const result = await agent.runAll({
  comment: "/kilo fix the bug",
  issueNumber: 123,
  auto: true,
  timeout: 2000,
});
```

## Development

```bash
# Build the package
yarn build

# Run CLI
yarn cli --help

# Run tests
yarn test
```

This utility has been developed for the [Goldstack](https://goldstack.party) starter project builder. Check it out for starting your next project ❤️
