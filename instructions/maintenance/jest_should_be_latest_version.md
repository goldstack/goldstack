# Jest Should Be Latest Version

## Target State

This repository aims to always use the latest fully released version of Jest. This ensures access to the latest testing features, performance improvements, and bug fixes.

## Implementation

To check and update Jest:

1. Check current version:
   ```
   npm info jest version
   ```

2. Update Jest and @types/jest to the latest versions:
   ```
   yarn up jest @types/jest
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

- Jest updates frequently with new testing features and improvements
- Latest versions include performance optimizations for test execution
- New matchers and assertions help write better tests
- @types/jest must be compatible with the Jest version used

## Maintenance

Check for Jest updates:
- Before starting new testing efforts
- As part of regular maintenance cycles
- When new Jest features are needed
