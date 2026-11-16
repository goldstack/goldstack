# Goldstack Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed Goldstack packages were last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

In client repositories this task also updates the AWS SDK. AWS is not gated separately there: it moves in lockstep with Goldstack and uses the same 60-day gate above.

1. Check workflow applicability

DO NOT RUN this task when you are on the github.com/goldstack/goldstack repo.

2. Update Goldstack
   ```
   yarn up jest @goldstack/*
   ```

   The Goldstack packages provide the build, bundling and template tooling used across the monorepo, so a bump here has a wide blast radius.

3. Check for additional monorepo dependencies

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

5. Run the verification gate (see `instructions/goldstack/patching.md`):
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
