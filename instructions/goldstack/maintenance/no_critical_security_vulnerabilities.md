# No Critical Security Vulnerabilities

Security tasks are exempt from version gating and always run.

1. Audit all packages:
   ```
   yarn npm audit --all --recursive --severity critical
   ```

2. If vulnerabilities are found:
   - Sort by easiest to fix first
   - For `@aws-sdk/*`, `@smithy/*`, or any other finding that can only be fixed by updating `@goldstack/*` or its transitive dependencies, do not bump a single package in isolation. Resolve it through the Goldstack latest version task (`goldstack_should_be_latest_version.md`), which moves Goldstack and AWS in lockstep. In the home Goldstack repository, where that task is a no-op, use the custom AWS SDK task (`instructions/custom/maintenance/aws_sdk_should_be_latest_version.md`) instead. Security work remains exempt from version gating.
   - Fix in this priority order:
     1. Update the direct or transitive dependency in `package.json`
     2. Update yarn configuration in `.yarnrc.yml` (if available)
   - If neither works, investigate using `resolutions` in `package.json`. Inform the user with a PR comment but DO NOT apply resolutions yourself — this is a last resort.

3. Run the verification gate (see `instructions/goldstack/patching.md`):
   ```
   yarn ensure-no-package-mismatches && yarn clean && yarn format && yarn lint && yarn compile
   ```

   A fix that bumps a shared library can leave older copies pinned elsewhere in the tree, so check for duplicate resolutions of the package you just changed. Two copies of a typed library do not share types and produce assignment errors naming both versions.

4. Re-run the audit to confirm vulnerabilities are resolved.