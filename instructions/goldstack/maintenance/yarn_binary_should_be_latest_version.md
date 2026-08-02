# Yarn Binary, SDKs, and Plugins Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the Yarn version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update Yarn binary to latest:
   ```
   yarn set version latest
   ```

2. Update Yarn SDKs:
   ```
   yarn dlx @yarnpkg/sdks base
   ```

3. If Yarn plugins are configured (check `.yarnrc.yml` for a `plugins:` section):
   - Update plugin entries to latest versions in `.yarnrc.yml`
   - Re-import plugins:
     ```
     yarn plugin import <plugin-name>
     ```


4. Ensure there are no stale yarn binaries left in `.yarn/releases/`. There should only be one *.mjs script, eg yarn-x.x.x.cjs`