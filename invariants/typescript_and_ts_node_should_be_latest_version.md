# TypeScript and ts-node Should Be Latest Version

## Target State

This repository aims to always use the latest fully released versions of TypeScript and ts-node. This ensures access to the latest TypeScript features, performance improvements, type safety enhancements, and security fixes.

## Implementation

To check and update TypeScript and ts-node versions:

1. Check current versions:
   ```
   npm info typescript version
   npm info ts-node version
   ```

2. Update TypeScript and ts-node to the latest versions:
   ```
   yarn up typescript ts-node
   ```

3. Validate package consistency:
   ```
   yarn ensure-no-package-mismatches
   ```

4. Run the standard checks:
   ```
   yarn format && yarn lint && yarn compile
   ```

5. Commit the changes.

## Rationale

- TypeScript updates frequently with new features and type system improvements
- Latest versions include performance optimizations for compilation
- New type safety features help catch bugs earlier
- ts-node compatibility with TypeScript versions is important for development workflow

## Maintenance

Check for TypeScript and ts-node updates:
- Before starting new features
- As part of regular maintenance cycles
- When new TypeScript features are needed
