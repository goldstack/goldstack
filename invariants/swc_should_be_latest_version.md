# @swc/* Packages Should Be Latest Version

## Target State

This repository aims to always use the latest fully released versions of SWC packages (`@swc/*`). This includes `@swc/core` and `@swc/jest`. These packages are used for fast TypeScript/JavaScript compilation and testing.

## Implementation

To check and update SWC packages:

1. Check current versions:
   ```
   npm info @swc/core version
   npm info @swc/jest version
   ```

2. Update SWC packages in all workspace `package.json` files:
   ```json
   "devDependencies": {
     "@swc/core": "^1.15.8",   // Update to latest version
     "@swc/jest": "^0.2.39"    // Update to latest version
   }
   ```

3. Validate package consistency:
   ```
   yarn ensure-no-package-mismatches
   ```

4. Run the standard checks:
   ```
   yarn format && yarn lint && yarn compile
   ```

5. Run tests to ensure compatibility:
   ```
   yarn test
   ```

6. Commit the changes.

## Rationale

- SWC provides significant performance improvements over Babel for compilation
- SWC updates include bug fixes and new transformation features
- @swc/jest is used for running tests, so updates affect test execution
- Consistent versions across workspaces prevent compatibility issues

## Maintenance

Check for SWC updates:
- Before major development efforts
- As part of regular maintenance cycles
- When performance improvements are needed
