# Yarn Binary, SDKs, and Plugins Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the Yarn version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update Yarn binary to latest:
   ```
   yarn set version latest
   ```

   This resolves through https://repo.yarnpkg.com/tags, which tracks the Berry releases. The `latest` tag on `registry.npmjs.org/yarn` is the unrelated Yarn 1 line (1.22.x) and is not what this command uses.

   Update `packageManager` in `package.json`, the binary under `.yarn/releases/`, and `yarnPath` in `.yarnrc.yml` together. A Yarn patch release does not change dependency resolutions, so `.pnp.cjs` is expected to stay unchanged; if it changes, that is worth understanding before committing.

2. Update Yarn SDKs:
   ```
   yarn dlx @yarnpkg/sdks base
   ```

   This can fail for reasons outside the repository. One known cause is a publishing defect upstream: if a package in the SDK toolchain declares a dependency through the `patch:` protocol pointing at a patch file that was never published, resolution fails with an `ENOENT` for that patch. Check whether the failure reproduces outside the repository — for example on a different Yarn version in an empty directory with an empty `HOME`, and with `yarn dlx` for an unrelated package — before concluding it is a local problem.

   If it cannot be completed, leave `.yarn/sdks/` exactly as it is rather than hand-editing the generated files, and say so explicitly in the PR description. Those files wrap the TypeScript compiler, so they are very likely already current unless TypeScript itself was bumped in the same run.

3. If Yarn plugins are configured (check `.yarnrc.yml` for a `plugins:` section):
   - Update plugin entries to latest versions in `.yarnrc.yml`
   - Re-import plugins:
     ```
     yarn plugin import <plugin-name>
     ```

   Skip this step entirely if there is no `plugins:` section.

4. Ensure there are no stale yarn binaries left in `.yarn/releases/`. There should be exactly one, eg `yarn-x.x.x.cjs`:
   ```bash
   ls .yarn/releases/
   yarn --version
   ```
   `yarn set version` normally removes the previous binary, but verify rather than assume, and confirm the reported version matches the `packageManager` field in `package.json`.

5. Run the standard checks (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```