# @swc/* Packages Should Be Latest Version

1. Check current versions:
   ```
   npm info @swc/core version
   npm info @swc/jest version
   ```

2. Update SWC packages:
   ```
   yarn up @swc/core @swc/jest
   ```

3. Run tests:
   ```
   yarn test
   ```

Follow the [patching workflow](../patching.md) to validate and commit.
Follow the [maintenance workflow](../maintenance.md) for PR management and time limits.
