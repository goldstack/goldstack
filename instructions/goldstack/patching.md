# Dependency Patching Workflow

This workflow applies every time a dependency is changed in the project.

## Semver Ranges

Always use `^` (caret) semver ranges in `package.json`. Never use `~` (tilde). The caret range allows minor and patch updates to flow naturally between version-bump maintenance runs, without locking to an overly narrow range.

After any `yarn up`, confirm no tilde range was introduced (see [version gating](./version-gating.md)).

## Steps

### 1. Run the Audit

Identify the vulnerable packages (use the task-specific command, e.g. `yarn npm audit`).

### 2. Update Dependencies

For each vulnerable package, first try updating within the existing version constraints:
```
yarn up <package>
```

This pulls the latest version that satisfies the current semver range.

If `yarn up` does not resolve the vulnerability (version constraint is too narrow), manually bump the version in `package.json` to a range that includes the fix - ONLY bump patch and minor version unless if explicitly asked to upgrade major version as well.

For a major-version bump, pass the intended major explicitly, e.g. `yarn up <package>@^5`. A bare `yarn up <package>` resolves to the `latest` dist-tag, which is a different major entirely.

### 3. Run the Verification Gate

Run all four before committing. Every task file that says "run the standard checks" means this block.

```
yarn ensure-no-package-mismatches \
  && yarn clean && yarn format && yarn lint && yarn compile \
  && ! grep '^  resolution: ' yarn.lock | sed 's/^  resolution: "//; s/"$//' | sed 's/@npm:.*//' | sort | uniq -c | awk '$1>1 && $2 == "<package>"{found=1} END{exit !found}'
```

#### Duplicate resolutions

`yarn up` only rewrites the ranges in workspace manifests. Descriptors pinned by *other* packages — commonly libraries in the dependency tree — keep their old resolutions, so the tree can end up with several incompatible copies of the same package.

This matters for anything with types: two copies of a client library are two distinct types, and a value built by one is not assignable to the other. It surfaces as `TS2322`/`TS2345` errors that mention two different versions of the same package in the type paths.

List every package that currently has more than one resolution:

```bash
grep '^  resolution: ' yarn.lock | sed 's/^  resolution: "//; s/"$//' | sed 's/@npm:.*//' | sort | uniq -c | awk '$1>1{print $2, $1}' | sort -rn
```

Many transitive duplicates are pre-existing and harmless. What matters is a package you just bumped appearing more than once. To fix that, force the remaining ranges to re-resolve:

```bash
yarn up -R <package>
```

`-R` re-resolves every matching range in the lockfile to the highest available version and does not modify any manifest. Re-run the duplicate check afterwards to confirm it worked.

#### Clean build

`yarn clean` is required, not optional. `yarn compile` runs `tsc --build`, which is incremental: it does not re-check a package whose own sources are unchanged, even when the types of its dependencies have changed. A dependency bump can therefore leave `yarn compile` reporting success while the project does not actually build. Always gate a dependency change on a clean build.

#### Lint baseline

`yarn lint` output should be compared against the baseline on the target branch. A change in the warning or error counts is a signal to investigate; an unchanged count means this change introduced no new findings.

Do NOT commit here — commit and push happen in the [maintenance workflow](./maintenance.md).

## A Clean Compile Is Not a Passing Test Suite

`tsc` checks types. It cannot see failures that only exist at runtime or in a specific test environment, such as a CommonJS/ESM mismatch, an unhandled rejection, or a live API call being rate limited.

Bumps that commonly break tests without breaking compilation:

- **Test runner bumps.** A new runner release may reject a module format that a previous release tolerated, which fails a suite before it runs a single test.
- **Libraries with conditional exports.** A package can map the same entry point to different builds for the `browser` and `node` conditions. A test environment using jsdom activates `browser` by default, which can resolve a module to a build the runner cannot load.
- **Anything that talks to a real API.**

When a bump can affect runtime behaviour, run the test suite for the affected workspace before committing:

```bash
cd packages/<affected-package> && GOLDSTACK_DEBUG=true yarn test src/path/to/affected.spec.ts
```

Never run the full suite from the repository root. Prefer running specific test files, and check the repository's testing instructions for suites that are slow or make real API calls.