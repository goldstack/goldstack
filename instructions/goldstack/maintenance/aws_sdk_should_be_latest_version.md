# AWS SDK Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed AWS SDK version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

In a client repository this task does **not** chase the newest npm release of `@aws-sdk/*`. It makes the whole dependency tree use the single AWS SDK version that the installed Goldstack packages resolve to. Upgrading the repository's own manifests independently is what produces two copies of the SDK across the Goldstack boundary, and two copies of a client library are two distinct types.

1. Identify current versions and duplicates:
   ```bash
   git grep -h '"@aws-sdk/\|"@smithy/' -- '**/package.json' package.json

   grep '^  resolution: ' yarn.lock | sed 's/^  resolution: "//; s/"$//' | sed 's/@npm:.*//' | sort | uniq -c | awk '$1>1{print $2, $1}' | sort -rn
   ```

   The AWS SDK is what signs requests and manages credentials and TLS, so this is worth taking even when it looks routine.

2. Determine the Goldstack AWS SDK version. The `@goldstack/template-*` packages (`template-sqs`, `template-dynamodb`, `template-lambda-*`, …) ship their own `@aws-sdk/*` ranges. Find the version they resolve to:
   ```bash
   yarn why @aws-sdk/client-sqs
   yarn why @aws-sdk/client-dynamodb
   yarn why @aws-sdk/lib-dynamodb
   ```
   The version listed against the `@goldstack/*` dependents is the target. Do **not** run `yarn up @aws-sdk/*` here: it only rewrites this repository's own manifests, leaves the Goldstack copy untouched, and creates the duplication this task exists to remove.

3. Pin the tree to that version. Add an exact entry to the root `package.json` `resolutions` block for every `@aws-sdk/*` package that resolves more than once:
   ```json
   "resolutions": {
     "@aws-sdk/client-dynamodb": "3.1143.0",
     "@aws-sdk/client-sqs": "3.1143.0",
     "@aws-sdk/lib-dynamodb": "3.1143.0"
   }
   ```
   Also align the declared ranges in the workspace manifests to `^<the same version>` (caret, per `instructions/goldstack/version-gating.md`), so the manifests agree with the forced resolution.

4. Re-resolve and verify:
   ```
   yarn install
   ```
   Re-run the duplicate-resolution check from step 1 for the packages you pinned. There must be exactly one resolution for each.

5. Run the verification gate (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

   `yarn ensure-no-package-mismatches` compares only this repository's manifests, so it cannot see the Goldstack packages' internal pins; that blind spot is why the boundary duplication reaches CI in the first place. The duplicate-resolution check in step 4 is the gate that catches it.

   Symptoms of two copies of the SDK in the tree:

   - `DynamoDBDocument.from(await connect(...))` where `connect` builds a client from one copy while `lib-dynamodb` is typed against another, as in `packages/automation-db/src/table.ts`. It may not fail visibly, but it is the same hazard as a type error.
   - `TS2322`/`TS2345` errors naming two different `@aws-sdk/client-*` versions in the type paths.
   - Command matching failing inside `@goldstack/template-sqs`, which matches mocked commands with `instanceof`. Two copies of `@aws-sdk/client-sqs` make `instanceof` false even when the command name is identical.

The AWS SDK runs independent version streams, so `@aws-sdk/core` legitimately resolves to a lower version number than the clients; that is expected, not a leftover.

The long-term fix — teaching `@goldstack/template-sqs` to match by command name rather than `instanceof` — is a change in the Goldstack packages, not in the client repository, and is out of scope for this task.
