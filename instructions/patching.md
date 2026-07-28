# Dependency Patching Workflow

This workflow applies every time a dependency is changed in the project.

## Steps

### 1. Run the Update Command
Execute the task-specific update command (see individual task instructions for the exact command).

### 2. Validate Package Consistency
```
yarn ensure-no-package-mismatches
```

### 3. Run Standard Checks
```
yarn format && yarn lint && yarn compile
```

### 4. Run Tests (if applicable)
```
yarn test
```
Only if the task requires testing (e.g. Jest, SWC updates).

### 5. Commit Changes
Commit all changes with a descriptive message.
