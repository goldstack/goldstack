---
id: agentic-engineering
title: Agentic Engineering
---

This page describes how this repository is set up for AI-assisted development ("agentic engineering"): how coding agents are instructed, how those instructions are kept in sync across derived projects, and how parallel development streams are isolated using git worktrees.

## Agent Instructions

The root-level [`AGENTS.md`](https://github.com/goldstack/goldstack/blob/master/AGENTS.md) file is the single entry point that coding agents (such as OpenCode, Claude Code or Codex) read when working in this repository. It is **generated content**: the actual instructions are maintained as standalone markdown files under `instructions/` and are inlined into `AGENTS.md` using [markdown-magic](https://github.com/DavidWells/markdown-magic).

Each block in `AGENTS.md` looks like:

```html
<!-- docs FILE src=./instructions/goldstack/agents.md -->
(inlined content)
<!-- /docs -->
```

Running `md-magic --file AGENTS.md` re-inlines all referenced files. This is wired up via the scripts in `package.json`.

### Instruction Sources

Instructions live in two locations:

- `instructions/goldstack/` - shared instructions that apply to this repository and are **synced to derived projects** (see below).
- `instructions/custom/` - per-repo authored instructions that are **never overwritten by syncs**. Use these for project-specific conventions, for example custom tooling like the Gitea CLI.

### Syncing to Derived Projects

Projects generated from (or maintained alongside) Goldstack pull the shared instructions into their own `instructions/goldstack/` directory and re-inline them into their own `AGENTS.md`:

```bash
yarn sync-instructions         # via vendir from the remote source
yarn sync-instructions-local   # from a local sibling checkout of goldstack
```

The local variant also installs worktrunk configuration (`.config/wt.toml`, see below) from the goldstack checkout.

## Git Worktrees

This repository is configured for use with [Worktrunk](https://worktrunk.dev), a CLI for managing git worktrees. Worktrees allow multiple branches to be checked out simultaneously - useful for running several coding agents in parallel without them stepping on each other's changes.

### Installation

```bash
brew install worktrunk
```

Optionally install shell integration with `wt config shell install`.

### Usage

```bash
wt switch --create my-feature   # create branch + worktree and switch to it
wt list                         # show all worktrees and their status
wt merge main                   # squash-commit, merge and clean up
wt remove                       # remove the current worktree
```

With the recommended user configuration (`worktree-path = "/data/worktrees/{{ repo }}/{{ branch | sanitize }}"`) worktrees are created under `/data/worktrees/<repo>/<branch>` instead of cluttering sibling directories of the checkout.

### Automated Setup on Creation

The repository defines project hooks in `.config/wt.toml`. When a new worktree is created, these hooks automatically:

- copy `.env*` files from the base checkout into the new worktree
- install dependencies based on the detected lockfile (`pnpm-lock.yaml` -> pnpm, `yarn.lock` / `.yarnrc.yml` -> yarn, otherwise npm)

For security reasons, worktrunk asks for one-time approval before executing project hooks for the first time; approvals are remembered in `~/.config/worktrunk/approvals.toml`.

### Worktree-Aware Agent Behaviour

Coding agents working in a worktree follow the rules documented in [AGENTS.md](https://github.com/goldstack/goldstack/blob/master/AGENTS.md): they detect whether they are in a linked worktree, keep all commits on the worktree branch, and only push and open pull requests after explicit approval.
