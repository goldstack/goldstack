# AWS SDK Should Be Latest Version

1. Identify current versions:
   ```
   grep -r "@aws-sdk\|@smithy" workspaces --include="package.json"
   ```

2. Update to latest:
   ```
   yarn up @aws-sdk/* @smithy/*
   ```

Follow the [patching workflow](../patching.md) to validate and commit.
Follow the [maintenance workflow](../maintenance.md) for PR management and time limits.
