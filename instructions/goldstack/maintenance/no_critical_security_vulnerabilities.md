# No Critical Security Vulnerabilities

Security tasks are exempt from version gating and always run.

1. Audit all packages:
   ```
   yarn npm audit --all --recursive --severity critical
   ```

2. If vulnerabilities are found:
   - Sort by easiest to fix first
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