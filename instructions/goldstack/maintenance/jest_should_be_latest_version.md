# Jest Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed Jest version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update Jest and @types/jest:
   ```
   yarn up jest @types/jest
   ```

2. Update React Testing Library packages. `@testing-library/react` v16+ requires React 18+ as a peer dependency, so ensure `react` and `react-dom` have been updated to a compatible version first (see the `next_js_should_be_latest_version.md` task). Run:
   ```
   yarn up @testing-library/dom @testing-library/jest-dom @testing-library/react
   ```

3. Update other Jest-related packages:
   ```
   yarn up jest-environment-jsdom jest-transform-stub
   ```

4. Update `@swc/jest`. This package must be kept in sync with `@swc/core` (it depends on the matching `swc_core` native bindings, e.g. `@swc/jest@0.2.39` pairs with `@swc/core@1.15.46` / `swc_core v74.x`). The matching `@swc/core` upgrade is covered by the `swc_should_be_latest_version.md` task. Run:
   ```
   yarn up @swc/jest
   ```

   If `@swc/jest` is already at its latest published version, leave it alone and record the no-op. Do not bump it to a version that does not pair with the `@swc/core` version resolved in the same run; a mismatch breaks the native binding at test time rather than at install time.

5. Remove the deprecated type packages. `@testing-library/jest-dom` and `@testing-library/react` now ship their own TypeScript types, so the DefinitelyTyped stub packages may no longer be needed. Check first, and only remove what is actually declared:
   ```bash
   git grep -n '"@types/testing-library' -- 'packages/*/package.json' package.json
   ```

   For each package found:
   ```
   yarn remove @types/testing-library__jest-dom @types/testing-library__react
   ```

   These stub packages are frequently not declared at all. If the grep returns nothing, skip this step and note it; do not add a package in order to remove it.

6. Run the standard checks (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

7. Run the affected test suites. A Jest bump is one of the changes most likely to break tests while leaving compilation green, because `tsc` cannot see anything about module formats or test environments. Run the suites of the workspaces you changed, from the workspace directory, selecting specific test files where possible:

   ```bash
   cd packages/<affected-package> && GOLDSTACK_DEBUG=true yarn test
   ```

   Two failure modes are worth checking for specifically:

   - **CommonJS/ESM strictness.** Newer Jest releases reject a file that contains ESM syntax when it is loaded through `require()`. A dependency that used to be loaded leniently can now fail a suite before it runs a single test.
   - **`browser` export conditions.** `jest-environment-jsdom` resolves packages using the `browser` condition by default. A dependency that ships a separate browser build — for example `@aws-sdk/core`, whose `./client` entry point maps to an ESM file under `browser` and to CommonJS under `node` — will then resolve to a build Jest cannot load, even though the same import works in the application's server runtime. If that happens, set `testEnvironmentOptions.customExportConditions` to `['node']` in the workspace's jsdom Jest config, and say so in the PR description.