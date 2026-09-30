# Next.js Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed Next.js version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update Next.js in all packages:
   ```
   yarn up next
   ```

2. Update React and React DOM to versions compatible with the new Next.js:
   ```
   yarn up react react-dom @types/react
   ```

   Only update `@types/react-dom` if it is actually declared as a dependency. Check first:
   ```bash
   git grep -n '"@types/react-dom"' -- 'packages/*/package.json' package.json
   ```

   A React minor bump is the single most likely change in this task set to break compilation, since it can change types across the whole component tree. If `yarn compile` fails, revert the React and `@types/react` changes, keep the Next.js patch bump in its own commit, and report it. Do not attempt to fix application code as part of this task.

3. Run the standard checks (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

4. Run the test suites of the packages that render React, from the workspace directory:
   ```bash
   cd packages/<affected-package> && GOLDSTACK_DEBUG=true yarn test
   ```

   Next.js rewrites `next-env.d.ts` during any `next build` or dev run. That file is generated, so if it shows up as modified it is not part of this change and should not be staged.

   Because Next.js resolves packages through the `browser` export condition when bundled for the client, and jsdom does the same in tests, a Next.js or React bump can change which build of a dependency a test loads. If a suite starts failing on a CommonJS/ESM mismatch, see the note on export conditions in `instructions/goldstack/patching.md`.