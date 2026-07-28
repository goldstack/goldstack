# AWS SDK Should Be Latest Version

1. Identify current versions:
   ```
   grep -r "@aws-sdk\|@smithy" workspaces --include="package.json"
   ```

2. Update to latest:
   ```
   yarn up @aws-sdk/* @smithy/*
   ```


