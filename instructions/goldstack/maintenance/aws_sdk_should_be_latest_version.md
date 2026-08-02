# AWS SDK Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed AWS SDK version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Identify current versions:
   ```
   grep -r "@aws-sdk\|@smithy" workspaces --include="package.json"
   ```

2. Update to latest:
   ```
   yarn up @aws-sdk/* @smithy/*
   ```


