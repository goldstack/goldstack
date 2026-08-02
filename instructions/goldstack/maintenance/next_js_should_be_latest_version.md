# Next.js Should Be Latest Version

Before proceeding, check the version gating (see `instructions/goldstack/version-gating.md`). If the installed Next.js version was last bumped less than 60 days ago, treat this task as a no-op and do not produce any changes.

1. Update Next.js in all packages:
   ```
   yarn up next
   ```

2. Update React and React DOM to versions compatible with the new Next.js:
   ```
   yarn up react react-dom @types/react @types/react-dom
   ```

