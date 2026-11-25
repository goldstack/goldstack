# Audit Agent Instructions

Keep the repository's agent-facing guidance accurate, concise and consistent.
This task audits it for bloat, drift, staleness and duplication, then acts
conservatively: a high-confidence, low-risk fix becomes a pull request; an
uncertain or policy-changing finding becomes an issue titled
`[Needs Attention] `; and a run that finds nothing to change is a no-op.

Follow `instructions/goldstack/maintenance.md` for the branch, commit, pull
request, CI and time-limit workflow. The rules below layer on top of it.

## 1. Discover the files to audit

Discover agent-facing files in the current checkout instead of assuming a fixed
list. At minimum inspect:

- `AGENTS.md` and any other root `AGENTS*.md` file.
- Every `*.md` file under `instructions/`.
- Prompt blocks (for example `prompt: |`) and comments in `.github/workflows/*.yml`
  and other workflow files.
- Agent configuration files such as `opencode.json`, `opencode.jsonc` and
  anything under `.opencode/`.
- Skill and agent definition files when present, for example
  `.opencode/skills/**/SKILL.md`, `skills/**`, `.claude/**`, `.kilo/**` or
  `.cline/**`.

List the candidates with the repository's own tooling, for example:

```bash
git ls-files 'AGENTS*.md' 'instructions/**/*.md' '.github/workflows/*.yml' \
  'opencode.json*' '.opencode/**' 'skills/**' '.claude/**' '.kilo/**' '.cline/**'
```

An entry that does not exist is absent, not a finding. Record which files were
audited and which were skipped in the pull request body or issue.

## 2. Audit each file

For each file, check the following. Quote the file path and line number for
every finding.

### Accuracy

- Referenced files, paths, commands, scripts, workflow inputs and job names,
  branch names, labels, secrets and tools still exist and are correct. Check
  commands against `package.json`, the workspace `package.json` files and the
  scripts they invoke.
- Links and cross-references resolve, including relative Markdown links.
- Statements about the forge (GitHub or Gitea) match the repository. Shared task
  files must stay forge agnostic where the workflow runs on both.
- Action versions and inputs match the workflows that use them.

### Staleness

- Guidance for tooling, workflows, agent names or processes that were removed,
  renamed or replaced.
- Files that nothing references, such as an orphaned `AGENTS_GHA.md`, are
  candidates to assess rather than automatically dead. Confirm with `git grep`
  before proposing removal.

### Bloat

- Repetition, over-long explanations, examples that add no information, and
  copies of the same rule across several files.
- Content that should live in one canonical file and be referenced elsewhere.

### Consistency

- Contradictions within a file and between files, including generated versus
  source and shared versus custom.
- Custom instructions intentionally override shared ones. Do not report a
  deliberate override as a conflict; only report an override that is
  accidental, contradicted by another custom file, or stale.

### Simplification

- Consolidate a repeated rule into one canonical section or a shared instruction
  file, then replace the duplicates with references.
- Prefer changes that survive `yarn sync-goldstack`: do not move shared content
  into a location that client repositories overwrite.
- If the same mechanical check is repeated across files, a small helper under
  `scripts/` may be better than more prose, but only when it clearly reduces
  maintenance.

## 3. Source-of-truth rules

- `AGENTS.md` is generated from `instructions/goldstack/agents.md` and
  `instructions/custom/agents.md`. Edit the sources, run
  `yarn sync-instructions`, and verify with `yarn sync-instructions-check`.
  Never hand-edit the generated blocks.
- In this repository (`github.com/goldstack/goldstack`),
  `instructions/goldstack/**` is canonical. Fix it directly here.
- In a client repository, `instructions/goldstack/**` is generated from upstream
  and replaced by `yarn sync-goldstack`. Do not commit local edits there. Fix
  `instructions/custom/**` and the regenerated `AGENTS.md` locally, and raise an
  issue for shared or upstream findings instead.
- Do not weaken or delete guidance just to shorten it. If the intent is unclear,
  raise an issue instead.
- Do not add new policy or invent rules that the repository does not already
  imply.

## 4. Decide between a pull request, an issue and a no-op

Open a pull request only when all of these hold:

- the statement is demonstrably wrong or stale, or the edit is a mechanical
  de-duplication with no change in meaning;
- the correct replacement is unambiguous and verifiable from the repository;
- the change is confined to files this repository owns;
- `yarn format-check`, `yarn lint`, `yarn compile` and
  `yarn sync-instructions-check` pass.

Raise or update an issue titled `[Needs Attention] ` when any of these hold:

- the change alters policy or intent, or requires choosing between valid
  alternatives;
- guidance may be deliberately duplicated or kept for another tool, and it
  cannot be confirmed dead;
- the finding is in shared `instructions/goldstack/**` while running in a client
  repository;
- files disagree and the correct resolution needs a maintainer decision.

Treat the run as a no-op when the audit finds nothing that satisfies either set
of conditions. Do not commit, open a pull request or open an issue merely to
report that the instructions were reviewed.

## 5. Evidence for every pull request and issue

Every pull request and issue must include, for each finding:

- the file path and line number;
- the current text, quoted;
- the suggested replacement or removal;
- concrete evidence, such as a command missing from `package.json`, a path that
  does not exist, a workflow input that no longer exists, or the locations of
  duplicate sections.

Before creating a pull request or issue, search open and recently closed issues
and pull requests for the same finding and comment on the existing item instead
of duplicating it. A later run must not create another issue for a finding that
is already open.

## 6. Verify the change

- Run `yarn format-check && yarn lint && yarn compile`.
- Run `yarn sync-instructions-check`. In this repository it confirms that the
  instructions are the source of truth; in a client repository it must pass
  after `yarn sync-instructions` or `yarn sync-goldstack`.
- If the audit changes a command or script, run that command to confirm it
  exists and behaves as described.
- Keep the diff small. Do not reformat or rewrite files beyond the findings.

## 7. Finish

- Follow `instructions/goldstack/maintenance.md` sections 3 and 4 for pull
  request creation, draft status and CI monitoring.
- Reference the task's issue with `Part of #<number>` unless the pull request
  completes the whole issue, in which case use `Closes #<number>`.
- In the final pull request comment or body, list the files audited, the
  findings fixed, and any finding deferred to an issue.
- If the run made no changes, exit as the no-op described in
  `instructions/goldstack/maintenance.md` section 2, leaving no pull request and
  no branch.
