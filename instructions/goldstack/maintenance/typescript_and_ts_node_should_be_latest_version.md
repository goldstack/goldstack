# TypeScript and ts-node Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed TypeScript version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update TypeScript and ts-node to the latest **minor/patch** version within the current major:
   ```
   yarn up typescript@^5 ts-node
   ```
   The explicit `@^5` is required. A bare `yarn up typescript` resolves to the `latest` dist-tag, which is a different major (currently TypeScript 7) and is a separate, manual task. Passing the range keeps the declared range inside the current major.

   Note that a repository declaring `"typescript": "^5"` is already tracking the newest 5.x, because the caret range floats and the lockfile resolves it. In that case this task is a no-op and produces no changes; confirm it and record the no-op rather than inventing a version to bump.

2. Run the standard checks (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

3. If `yarn compile` fails after the upgrade:
   - Do **not** modify `tsconfig*.json` files — tsconfig changes are out of scope for this task.
   - Do **not** commit generated files (`*.d.ts`, `*.js`, `*.js.map`, `*.tsbuildinfo`, `dist/`, `build/`).
   - Revert the upgrade, leave a comment on the PR explaining that the latest patch/minor in the current major breaks the codebase, and close the task. A major-version migration can be handled as a dedicated task.

   `yarn compile` is incremental and may report success without re-checking packages whose dependency types changed. Always run it against a clean build before concluding that the bump is safe.