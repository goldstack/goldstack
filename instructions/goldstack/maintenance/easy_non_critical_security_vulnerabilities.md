# Resolve Easy Non-Critical Security Vulnerabilities

Security tasks are exempt from version gating and always run.

1. Audit all packages for high, moderate, and low vulnerabilities:
   ```
   yarn npm audit --all --recursive
   ```

2. For each non-critical vulnerability (high, moderate, low):
   - For `@aws-sdk/*`, `@smithy/*`, or any other finding that can only be fixed by updating `@goldstack/*` or its transitive dependencies, do not bump a single package in isolation. Resolve it through the Goldstack latest version task (`goldstack_should_be_latest_version.md`), which moves Goldstack and AWS in lockstep. In the home Goldstack repository, where that task is a no-op, use the custom AWS SDK task (`instructions/custom/maintenance/aws_sdk_should_be_latest_version.md`) instead. Security work remains exempt from version gating.
   - Otherwise, try `yarn up <package>` to update within the current semver range
   - If resolved, move to the next vulnerability
   - If `yarn up` does not resolve it (major version jump required, or no fix available), skip — only easy fixes

3. Run the verification gate (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

   This task runs `yarn up` repeatedly across several packages, which is exactly the operation that can leave a library present in more than one version: `yarn up` rewrites only the ranges in workspace manifests, while descriptors pinned elsewhere in the tree keep their old resolutions. Two copies of a typed library do not share types, so this shows up as assignment errors naming two different versions. If it happens, `yarn up -R <package>` re-resolves the remaining ranges without modifying any manifest.

4. Re-run the audit to confirm resolved vulnerabilities are gone.

5. Record every skipped finding in the pull request description, naming the package and the reason it was skipped: it can only be resolved through the Goldstack bump, `yarn up` did not resolve it, or a major version jump is required. Do not leave a skipped finding unexplained.