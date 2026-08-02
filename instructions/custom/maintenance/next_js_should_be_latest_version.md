# Next.js Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed Next.js version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

The `.syncpackrc.js` configuration in this monorepo has an empty `versionGroups` array, which means packages are not required to use the same version of a dependency. In principle, each package using `next` could be upgraded independently. However, this workspace currently uses only one Next.js version across all packages, which is the typical pattern for Goldstack template users — and the assumption of this task is that the same holds at the time it is run.

1. Identify all packages that depend on `next` and confirm they all use the same version range:
   ```
   grep -r "\"next\"" --include="package.json" --exclude-dir=node_modules
   ```

2. For each such package, change into the package directory and update Next.js (along with the React packages that Next.js requires a matching version for):
   ```
   yarn up next react react-dom @types/react @types/react-dom
   ```

3. Re-run the grep from step 1 to confirm all packages now reference the new version.

