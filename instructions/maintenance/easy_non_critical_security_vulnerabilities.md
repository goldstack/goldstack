# Resolve Easy Non-Critical Security Vulnerabilities

1. Audit all packages for high, moderate, and low vulnerabilities:
   ```
   yarn npm audit --all --recursive
   ```

2. For each non-critical vulnerability (high, moderate, low):
   - Try `yarn up <package>` to update within the current semver range
   - If resolved, move to the next vulnerability
   - If `yarn up` does not resolve it (major version jump required, or no fix available), skip — only easy fixes

3. Re-run the audit to confirm resolved vulnerabilities are gone.

Follow the [patching workflow](../patching.md) to validate.
Follow the [maintenance workflow](../maintenance.md) for commit, push, PR management, CI monitoring, and time limits.
