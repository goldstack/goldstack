# Version Gating

Some maintenance tasks bump dependencies to their latest versions (TypeScript, Jest, Yarn, Next.js, SWC, AWS SDK, Goldstack). These updates should only run when the currently installed version is **older than 60 days**.

Security vulnerability tasks are exempt from gating and always run.

## Version Ranges

Always use `^` (caret) semver ranges in `package.json`. Never use `~` (tilde). The caret allows minor and patch updates to flow naturally when the 60-day gating permits an update, without locking to an overly narrow range that would block minor version improvements.

## How to Check

Before performing any version bump, determine whether the update is due:

1. Identify the primary package being updated (e.g. `typescript`, `jest`, `@swc/core`, `next`).
2. Check how long ago the current version entry was last committed:
   ```bash
   LAST_UPDATE=$(git log --format="%ct" -1 -S '"<package-name>"' -- "**/package.json" || echo 0)
   DAYS_AGO=$(( ($(date +%s) - LAST_UPDATE) / 86400 ))
   echo "$DAYS_AGO days since last version bump"
   ```
3. If `DAYS_AGO < 60` → treat this task as a **no-op** (do not commit, do not open a PR).
4. If `DAYS_AGO >= 60` or the command returns `0` (no matching commit found) → proceed with the update.
