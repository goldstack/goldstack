# Goldstack Should Be Latest Version

1. Check workflow applicability

DO NOT RUN this task when you are on the github.com/goldstack/goldstack repo.

2. Update Goldstack
   ```
   yarn up jest @goldstack/*
   ```

3. Check for additional monorepo dependencies

Some packages that ship as part of Goldstack are published under their own unscoped names rather than under the `@goldstack/*` scope (for example `esbuild-ssr-css-modules-plugin` or `node-css-require`). `yarn up @goldstack/*` will not pick these up, so they need to be upgraded explicitly. Known packages to watch for:

- `esbuild-ignore-with-comments-plugin`
- `esbuild-ssr-css-modules-plugin`
- `esbuild-tailwind-ssr-plugin`
- `static-file-mapper`
- `static-file-mapper-build`
- `node-css-require`
- `mock-aws-s3-v3`
- `lambda-compression`

Use `yarn why` to discover which of these are present in the project, then `yarn up` each one that is installed:

   ```
   for pkg in esbuild-ignore-with-comments-plugin esbuild-ssr-css-modules-plugin esbuild-tailwind-ssr-plugin static-file-mapper static-file-mapper-build node-css-require mock-aws-s3-v3 lambda-compression; do
     if [ -n "$(yarn why "$pkg" 2>&1)" ]; then
       yarn up "$pkg"
     fi
   done
   ```


