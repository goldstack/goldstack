# No High or Critical Security Vulnerabilities

## Target State

This repository aims to maintain zero high or critical security vulnerabilities in all dependencies (direct and transitive). This ensures the security and integrity of the project.

## Implementation

To check for security vulnerabilities:

1. Run the following command in the project root:
   ```
   yarn npm audit --all --recursive --severity high
   ```

2. This will audit all packages in the workspace and report any high or critical vulnerabilities.

3. If vulnerabilities are found:
   - Sort them by easiest to fix to hardest to fix
   - Fix them in that order following this priority:
     1. **First**: Update the direct or transitive dependency in `package.json`
     2. **Second**: Update yarn configuration in `.yarnrc.yml` (if available)
   - If vulnerabilities cannot be fixed with 1. or 2. from above, then investigate if the vulnerability can be fixed using `resolutions` in `package.json`. If so, inform the user with a PR comment BUT DO NOT APPLY THE RESOLUTION YOURSELF - this is a last resort and should be done by the user.

4. To validate no package mismatches after updates:
   ```
   yarn ensure-no-package-mismatches
   ```

5. After fixing, re-run the audit to confirm vulnerabilities are resolved.

## Rationale

- High and critical vulnerabilities can expose the project to security attacks
- Regular auditing helps catch and fix issues early
- Prioritizing updates over resolutions maintains cleaner dependency management
- Consistent package versions across the workspace reduces complexity

## Maintenance

Run the security audit regularly, especially:
- Before releases
- After adding new dependencies
- As part of regular maintenance cycles
