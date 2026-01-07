# Yarn Binary Should Be Latest Version

## Target State

This repository aims to always use the latest fully released version of Yarn PnP (Yarn Berry). This ensures we benefit from the latest features, performance improvements, and security fixes.

## Implementation

To update the Yarn binary to the latest version:

1. Run the following command in the project root:
   ```
   yarn set version latest
   ```

2. This will download the latest stable release and update the `.yarnrc.yml` file with the new `yarnPath`.

3. After updating, run the standard checks:
   ```
   yarn format && yarn lint && yarn compile
   ```

4. Commit the changes, including the updated `.yarnrc.yml`, `package.json` (if packageManager field is updated), and the new Yarn binary in `.yarn/releases/`.

## Rationale

- Staying on the latest version minimizes compatibility issues and ensures access to cutting-edge features.
- Yarn PnP provides faster installs and better dependency management.
- Regular updates help catch potential issues early.

## Maintenance

Periodically check for updates and apply them as part of maintenance tasks. The CI/CD pipeline should validate that the Yarn version is up-to-date.