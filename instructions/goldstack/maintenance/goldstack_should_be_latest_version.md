# Goldstack Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). The gate applies **only** to the dependency update steps below. The synchronisation steps are driven by differences in the upstream Goldstack repository and must run even when the version gate is not due. If the gate is not due and there are no upstream differences, the task is a no-op and must not produce a commit or pull request.

In client repositories this task also updates the AWS SDK. AWS is not gated separately there: it moves in lockstep with Goldstack and uses the same 60-day gate above.

1. Check workflow applicability

DO NOT RUN this task when you are on the github.com/goldstack/goldstack repo.

2. Update Goldstack

This step is gated: skip it when the Goldstack packages were last bumped less than 60 days ago, but still run the synchronisation steps below.

   ```
   yarn up jest @goldstack/*
   ```

   The Goldstack packages provide the build, bundling and template tooling used across the monorepo, so a bump here has a wide blast radius.

3. Check for additional monorepo dependencies

This step is gated with the Goldstack package update in step 2.

Some packages that ship as part of Goldstack are published under their own unscoped names rather than under the `@goldstack/*` scope (for example `esbuild-ssr-css-modules-plugin` or `node-css-require`). `yarn up @goldstack/*` will not pick these up, so they need to be upgraded explicitly. Known packages to watch for:

- `esbuild-ignore-with-comments-plugin`
- `esbuild-ssr-css-modules-plugin`
- `esbuild-tailwind-ssr-plugin`
- `static-file-mapper`
- `static-file-mapper-build`
- `node-css-require`
- `mock-aws-s3-v3`
- `lambda-compression`

Use `yarn why` to discover which of these are present in the project, then `yarn up` each one that is installed:

   ```
   for pkg in esbuild-ignore-with-comments-plugin esbuild-ssr-css-modules-plugin esbuild-tailwind-ssr-plugin static-file-mapper static-file-mapper-build node-css-require mock-aws-s3-v3 lambda-compression; do
     if [ -n "$(yarn why "$pkg" 2>&1)" ]; then
       yarn up "$pkg"
     fi
   done
   ```

   `yarn why` prints nothing for a package that is not installed, so the guard above only fires for packages that are genuinely present. Do not add any of these packages to a manifest in order to upgrade them; if none are installed, skip the step and say so.

4. Align the AWS SDK to the Goldstack version

This step is gated with the Goldstack package update in step 2.

   Do **not** run `yarn up @aws-sdk/*` here. The installed `@goldstack/template-*` packages ship their own `@aws-sdk/*` ranges, so bumping this repository's manifests independently leaves two copies of the SDK across the Goldstack boundary. Two copies of a client library are two distinct types. Instead, make the whole dependency tree use the single AWS SDK version that the updated Goldstack packages resolve to.

   a. Identify current versions and duplicates:
   ```bash
   git grep -h '"@aws-sdk/\|"@smithy/' -- '**/package.json' package.json

   grep '^  resolution: ' yarn.lock | sed 's/^  resolution: "//; s/"$//' | sed 's/@npm:.*//' | sort | uniq -c | awk '$1>1{print $2, $1}' | sort -rn
   ```

   b. Determine the Goldstack AWS SDK version. The `@goldstack/template-*` packages (`template-sqs`, `template-dynamodb`, `template-lambda-*`, …) ship their own `@aws-sdk/*` ranges. Find the version they resolve to:
   ```bash
   yarn why @aws-sdk/client-sqs
   yarn why @aws-sdk/client-dynamodb
   yarn why @aws-sdk/lib-dynamodb
   ```
   The version listed against the `@goldstack/*` dependents is the target.

   c. Pin the tree to that version. Add an exact entry to the root `package.json` `resolutions` block for every `@aws-sdk/*` package that resolves more than once:
   ```json
   "resolutions": {
     "@aws-sdk/client-dynamodb": "3.1143.0",
     "@aws-sdk/client-sqs": "3.1143.0",
     "@aws-sdk/lib-dynamodb": "3.1143.0"
   }
   ```
   Also align the declared ranges in the workspace manifests to `^<the same version>` (caret, per `instructions/goldstack/version-gating.md`), so the manifests agree with the forced resolution.

   d. Re-resolve and verify:
   ```
   yarn install
   ```
   Re-run the duplicate-resolution check from step 4a for the packages you pinned. There must be exactly one resolution for each.

5. Synchronise shared instructions and Goldstack-owned files

Run:

   ```
   yarn sync-goldstack
   ```

   This command does the following:

   - Fetches a sparse checkout of the Goldstack repository into `.agent-tmp/goldstack-source`, unless `GOLDSTACK_SOURCE_DIR` points at an existing checkout.
   - Replaces `instructions/goldstack/` with the upstream version. That directory is generated content; never edit it by hand. `instructions/custom/` belongs to the project and is never overwritten.
   - Re-inlines the instruction files into `AGENTS.md`.
   - Writes `.agent-tmp/goldstack-sync-report.md`, which lists differences in the project root Terraform configuration and in every package that was generated from a Goldstack template.

   To inspect the same differences without changing any files, run `yarn sync-goldstack-check`. It prints the report and the instruction status, and exits with a non-zero status only when `instructions/goldstack` is out of date. Newly generated projects also run this check in their default branch workflow.

   If the command cannot reach the Goldstack repository, note that in the final pull request comment, skip steps 6–10, and continue with the dependency changes and the verification in step 11. Do not hand-edit the generated instruction files.

6. Apply instruction improvements

   Review the change with:

   ```
   git diff -- instructions/goldstack AGENTS.md
   ```

   Pull in the upstream improvements. If an upstream instruction contradicts something in `instructions/custom`, the custom instruction wins; leave it and note the conflict.

7. Review the project root Terraform configuration

   Compare `config/infra/aws/` with `workspaces/templates/config/infra/aws/` in `.agent-tmp/goldstack-source`. The sync report includes this comparison.

   Safe to pull in:

   - `.gitignore` entries and other tooling files.
   - Provider and `required_version` updates, if the package-level Terraform files changed accordingly.
   - Formatting, comments and shared variable/output definitions that do not change which resources exist.

   Keep project-specific values:

   - `terraform.json`, especially `remoteState`, state bucket and lock table names.
   - Backend configuration, AWS account, region and deployment names.

   A change that would replace or delete resources, migrate remote state, or change the backend is larger work. Create an issue as described in step 10 instead of applying it.

8. Review template-managed package files

   For every package in `packages/`:

   a. Read `packages/<name>/goldstack.json` to find the `template` (and `templateVersion`) it was generated from.

   b. Find the matching template at
      `.agent-tmp/goldstack-source/workspaces/templates/packages/<template>/`.

   c. Read that template's `build.json`. Only the paths in `include` (minus `exclude`) were copied into the project and are template-managed. The sync report uses the same list.

   d. Compare the template-managed files, especially `infra/`, `scripts/`, `src/`, `docs/`, shared config and test setup, and pull in improvements.

   Do not overwrite project ownership:

   - `goldstack.json` deployments, deployment configuration, `tfStateKey`, `awsUser` and `awsRegion`.
   - Fields listed in the template's `build.json` `overwriteFiles`; those are intentionally project-owned.
   - `package.json` name, license and any dependency, script or version the project has changed. Merge upstream changes into the existing manifest instead of replacing the file.
   - Files the report lists as `project-only`; they may be project customisations and must not be deleted merely because upstream does not have them.
   - `build.json` itself and generated or deployment artifacts such as `.terraform/`, `tfplan` and state files.

   If the project has customised a template-managed file and the upstream change conflicts with that customisation, adapt the upstream change instead of discarding the customisation.

9. Template version

   Do not bump the package's `templateVersion` merely because files were synced. Only set it to the upstream template version when every template-managed file for that package matches the upstream version and the project has no conflicting customisations. If the version jump is large or needs manual migration, treat it as larger work in step 10.

10. Create an issue for larger improvements

   Some improvements are too large or too risky to apply in this task. Create an issue in this project for each one, then continue with the safe improvements. This instruction is forge agnostic: detect the forge from `git remote get-url origin`, and read `instructions/custom` for any project-specific server details.

   GitHub:

   ```
   gh issue create --title "<title>" --body "<body>"
   ```

   Gitea:

   ```
   tea issues create --title "<title>" --body "<body>"
   ```

   If neither CLI is available, use the forge's web interface or API, or add the same information to the maintenance pull request body and say so.

   Do not assume GitHub, and do not write "create a gh issue" in the issue text.

   The issue body must include:

   - the upstream Goldstack change that should be adopted and why;
   - the affected project paths and the corresponding upstream paths;
   - why it is not safe to apply automatically, for example a resource replacement, a state migration, a breaking API change, a missing decision, or a conflict with a project customisation;
   - a reference to the upstream commit, pull request or template version.

   Typical larger-work items:

   - Terraform changes that replace or delete resources, change remote state or the backend, or need a state migration.
   - Large template version jumps or changes that need manual migration.
   - Changes that need new dependencies, secrets, DNS or third-party accounts.
   - Changes to a file the project has heavily customised.

11. Run the verification gate (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

   `yarn ensure-no-package-mismatches` compares only this repository's manifests, so it cannot see the Goldstack packages' internal pins; that blind spot is why the boundary duplication reaches CI in the first place. The duplicate-resolution check in step 4d is the gate that catches it.

   Symptoms of two copies of the SDK in the tree:

   - `DynamoDBDocument.from(await connect(...))` where `connect` builds a client from one copy while `lib-dynamodb` is typed against another, as in `packages/automation-db/src/table.ts`. It may not fail visibly, but it is the same hazard as a type error.
   - `TS2322`/`TS2345` errors naming two different `@aws-sdk/client-*` versions in the type paths.
   - Command matching failing inside `@goldstack/template-sqs`, which matches mocked commands with `instanceof`. Two copies of `@aws-sdk/client-sqs` make `instanceof` false even when the command name is identical.

The AWS SDK runs independent version streams, so `@aws-sdk/core` legitimately resolves to a lower version number than the clients; that is expected, not a leftover.

The long-term fix — teaching `@goldstack/template-sqs` to match by command name rather than `instanceof` — is a change in the Goldstack packages, not in the client repository, and is out of scope for this task.
