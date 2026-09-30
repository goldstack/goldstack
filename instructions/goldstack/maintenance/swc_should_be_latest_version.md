# @swc/* Packages Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed SWC version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update SWC packages:
   ```
   yarn up @swc/core @swc/jest
   ```

2. `@swc/jest` must stay in sync with `@swc/core`, because it depends on the matching native bindings. If the update moves `@swc/core` to a version whose paired `@swc/jest` is not yet published, revert just the `@swc/jest` bump and note it. If `@swc/jest` is already at its latest published version, leave it alone and record the no-op — do not force a bump.

3. Run the standard checks (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

   `@swc/core` supplies the transform used by Jest via `@swc/jest`, so a mismatch between the two surfaces as a native binding failure at test time — typically `Failed to load native binding` — rather than as a compile error. If the test suite cannot load the binding after this bump, check that the installed `@swc/jest` pairs with the installed `@swc/core` before looking anywhere else.