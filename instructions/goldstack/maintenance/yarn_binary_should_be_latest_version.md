# Yarn Binary, SDKs, and Plugins Should Be Latest Version

1. Update Yarn binary to latest:
   ```
   yarn set version latest
   ```

2. Update Yarn SDKs:
   ```
   yarn dlx @yarnpkg/sdks base
   ```

3. If Yarn plugins are configured (check `.yarnrc.yml` for a `plugins:` section):
   - Update plugin entries to latest versions in `.yarnrc.yml`
   - Re-import plugins:
     ```
     yarn plugin import <plugin-name>
     ```


