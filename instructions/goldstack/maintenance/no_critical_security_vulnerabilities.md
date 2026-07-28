# No Critical Security Vulnerabilities

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

3. Re-run the audit to confirm vulnerabilities are resolved.


