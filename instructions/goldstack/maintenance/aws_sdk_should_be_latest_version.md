# AWS SDK Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed AWS SDK version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Identify current versions. Search the workspace manifests, which live in `packages/*/package.json` (plus the repository root `package.json`):
   ```bash
   git grep -h '"@aws-sdk/\|"@smithy/' -- 'packages/*/package.json' package.json
   ```

   The AWS SDK is what signs requests and manages credentials and TLS, so this bump is worth taking even when it looks routine.

2. Update to latest:
   ```
   yarn up @aws-sdk/* @smithy/*
   ```

   `@smithy/*` packages are usually transitive rather than direct dependencies. Check before including them; `yarn up` only rewrites ranges that appear in workspace manifests.

3. Check for duplicate resolutions, and run the verification gate (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

   The duplicate check matters more here than for most bumps. Many libraries in the dependency tree — Goldstack templates among them — pin their own older `@aws-sdk/*` descriptors, so `yarn up` can leave the tree with two copies of the SDK at once, including two copies of `@aws-sdk/client-dynamodb`. Where a `DynamoDBClient` built by one copy is passed to a library typed against the other, TypeScript reports the client as unassignable:

   ```
   error TS2322: Type '...@aws-sdk-client-dynamodb-npm-3.1101.0.../DynamoDBClient'
   is not assignable to type '...@aws-sdk-client-dynamodb-npm-3.1143.0.../DynamoDBClient'
   ```

   If that happens, force the remaining ranges to re-resolve:
   ```
   yarn up -R @aws-sdk/*
   ```
   `-R` does not modify any manifest. Note that the AWS SDK runs independent version streams, so `@aws-sdk/core` legitimately resolves to a lower version number than the clients; that is expected, not a leftover.