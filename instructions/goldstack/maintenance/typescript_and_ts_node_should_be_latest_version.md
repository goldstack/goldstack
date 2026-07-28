# TypeScript and ts-node Should Be Latest Version

1. Update TypeScript and ts-node to the latest **minor/patch** version within the current major:
   ```
   yarn up typescript@~ ts-node
   ```
   The `~` (tilde) range limits the upgrade to the same major and minor, so a `5.9.x` install will update to the latest `5.9.x` but will not jump to TypeScript 7. A major-version migration is a separate, manual task.

2. Run the standard checks (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn format && yarn lint && yarn compile
   ```

3. If `yarn compile` fails after the upgrade:
   - Do **not** modify `tsconfig*.json` files — tsconfig changes are out of scope for this task.
   - Do **not** commit generated files (`*.d.ts`, `*.js`, `*.js.map`, `*.tsbuildinfo`, `dist/`, `build/`).
   - Revert the upgrade, leave a comment on the PR explaining that the latest patch/minor in the current major breaks the codebase, and close the task. A major-version migration can be handled as a dedicated task.

