# AWS SDK Should Be Latest Version

## Target State

This repository aims to always use the latest fully released versions of AWS SDK packages (`@aws-sdk/*` and `@smithy/*`). This ensures compatibility with AWS services, access to the latest features, performance improvements, and security fixes.

## Implementation

To update AWS SDK packages to the latest version:

1. Run the following command in the project root to identify current versions:
   ```
   grep -r "@aws-sdk\|@smithy" workspaces --include="package.json"
   ```

2. To update all AWS SDK packages to the latest version, update the dependencies in each `package.json` file:
   ```
   yarn workspaces foreach -A -v --include "*-api,*-email-send,*-client-*,*dynamodb*" npm info "@aws-sdk/client-s3" version
   ```

3. For each package.json, update the AWS SDK dependencies to the latest version:
   - Update `@aws-sdk/*` packages (e.g., `@aws-sdk/client-s3`, `@aws-sdk/client-ses`, etc.)
   - Update `@smithy/*` packages (e.g., `@smithy/types`, `@smithy/smithy-client`)

4. After updating, validate package consistency:
   ```
   yarn ensure-no-package-mismatches
   ```

5. Run the standard checks:
   ```
   yarn format && yarn lint && yarn compile
   ```

6. Commit the changes.

## Rationale

- AWS SDK updates frequently with new features and security patches
- Using consistent versions across the workspace prevents compatibility issues
- Latest versions often include performance improvements
- AWS SDK and Smithy packages should be updated together for compatibility

## Maintenance

Check for AWS SDK updates:
- Monthly, as part of regular maintenance
- When AWS announces new features or deprecations
- Before major releases
