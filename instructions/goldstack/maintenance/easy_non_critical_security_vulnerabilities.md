# Resolve Easy Non-Critical Security Vulnerabilities

Security tasks are exempt from version gating and always run.

1. Audit all packages for high, moderate, and low vulnerabilities:
   ```
   yarn npm audit --all --recursive
   ```

2. For each non-critical vulnerability (high, moderate, low):
   - Try `yarn up <package>` to update within the current semver range
   - If resolved, move to the next vulnerability
   - If `yarn up` does not resolve it (major version jump required, or no fix available), skip — only easy fixes

3. Run the verification gate (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

   This task runs `yarn up` repeatedly across several packages, which is exactly the operation that can leave a library present in more than one version: `yarn up` rewrites only the ranges in workspace manifests, while descriptors pinned elsewhere in the tree keep their old resolutions. Two copies of a typed library do not share types, so this shows up as assignment errors naming two different versions. If it happens, `yarn up -R <package>` re-resolves the remaining ranges without modifying any manifest.

4. Re-run the audit to confirm resolved vulnerabilities are gone.