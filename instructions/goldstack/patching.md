# Dependency Patching Workflow

This workflow applies every time a dependency is changed in the project.

## Steps

### 1. Run the Audit
Identify the vulnerable packages (use the task-specific command, e.g. `yarn npm audit`).

### 2. Update Dependencies
For each vulnerable package, first try updating within the existing version constraints:
```
yarn up <package>
```
This pulls the latest version that satisfies the current semver range.

If `yarn up` does not resolve the vulnerability (version constraint is too narrow), manually bump the version in `package.json` to a range that includes the fix - ONLY bump patch and minor version unless if explicitly asked to upgrade major version as well.

### 3. Validate Package Consistency
```
yarn ensure-no-package-mismatches
```

### 4. Run Standard Checks
```
yarn format && yarn lint && yarn compile
```

Do NOT commit here — commit and push happen in the [maintenance workflow](../maintenance.md).
