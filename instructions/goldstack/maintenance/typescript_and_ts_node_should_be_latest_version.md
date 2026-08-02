# TypeScript and ts-node Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed TypeScript version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update TypeScript and ts-node to the latest **minor/patch** version within the current major:
   ```
   yarn up typescript ts-node
   ```
   A major-version migration (e.g. TypeScript 7) is a separate, manual task.

2. Run the standard checks (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn format && yarn lint && yarn compile
   ```

3. If `yarn compile` fails after the upgrade:
   - Do **not** modify `tsconfig*.json` files — tsconfig changes are out of scope for this task.
   - Do **not** commit generated files (`*.d.ts`, `*.js`, `*.js.map`, `*.tsbuildinfo`, `dist/`, `build/`).
   - Revert the upgrade, leave a comment on the PR explaining that the latest patch/minor in the current major breaks the codebase, and close the task. A major-version migration can be handled as a dedicated task.
