# Version Gating

Some maintenance tasks bump dependencies to their latest versions (TypeScript, Jest, Yarn, Next.js, SWC, AWS SDK, Goldstack). These updates should only run when the currently installed version is **older than 60 days**.

Security vulnerability tasks are exempt from gating and always run.

## Version Ranges

Always use `^` (caret) semver ranges in `package.json`. Never use `~` (tilde). The caret allows minor and patch updates to flow naturally when the 60-day gating permits an update, without locking to an overly narrow range that would block minor version improvements.

`yarn up` preserves the existing modifier, so a caret range stays a caret range. Still confirm it after the update:

```bash
git diff -- '*package.json' | grep '^+' | grep '~' && echo "ERROR: tilde range introduced" || echo "OK: caret ranges preserved"
```

If a tilde range did appear, re-run the update with `--caret`. A tilde range also fails `yarn ensure-no-package-mismatches` in repos that configure a `semverGroups` rule for `^`.

## How to Check

Before performing any version bump, determine whether the update is due.

1. Identify the primary package being updated (e.g. `typescript`, `jest`, `@swc/core`, `next`).
2. Resolve the range currently declared for it, then find the commit that introduced that exact range:

   ```bash
   PKG="<package-name>"

   RANGE=""
   for f in package.json packages/*/package.json; do
     [ -f "$f" ] || continue
     v=$(jq -r --arg p "$PKG" '(.dependencies[$p] // .devDependencies[$p]) // empty' "$f" 2>/dev/null)
     [ -n "$v" ] && RANGE="$v" && break
   done

   if [ -z "$RANGE" ]; then
     echo "$PKG is not declared in this repository; nothing to gate"
   else
     LAST_UPDATE=$(git log --format="%ct" -1 -S "\"$PKG\": \"$RANGE\"" -- '**/package.json' || echo 0)
     DAYS_AGO=$(( ($(date +%s) - LAST_UPDATE) / 86400 ))
     echo "$PKG ($RANGE): $DAYS_AGO days since last version bump"
   fi
   ```

3. If `DAYS_AGO < 60` → treat this task as a **no-op** (do not commit, do not open a PR).
4. If `DAYS_AGO >= 60`, or the package is not declared, or the command returns `0` (the range has never changed since it was first committed) → proceed with the update.

### Why the search must include the range

`git log -S` matches commits where the **number of occurrences** of the search string changed. Searching for `"<package-name>"` alone therefore matches only the commit that first added the dependency: changing `^1.15.47` to `^1.16.13` does not change how many times `"@swc/core"` appears in `package.json`.

The practical effect of getting this wrong is that the gate always reports the age of the initial commit and always says "proceed", so a package bumped yesterday looks permanently overdue. Searching for `"<package-name>": "<current-range>"` matches the commit that last set the range the repository is actually on, which is what the gate is meant to measure.