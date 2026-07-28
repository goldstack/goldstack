# Jest Should Be Latest Version

1. Update Jest and @types/jest:
   ```
   yarn up jest @types/jest
   ```

2. Update React Testing Library packages. `@testing-library/react` v16+ requires React 18+ as a peer dependency, so ensure `react` and `react-dom` have been updated to a compatible version first (see the `next_js_should_be_latest_version.md` task). Run:
   ```
   yarn up @testing-library/dom @testing-library/jest-dom @testing-library/react
   ```

3. Update other Jest-related packages:
   ```
   yarn up jest-environment-jsdom jest-transform-stub
   ```

4. Update `@swc/jest`. This package must be kept in sync with `@swc/core` (it depends on the matching `swc_core` native bindings, e.g. `@swc/jest@0.2.39` pairs with `@swc/core@1.15.46` / `swc_core v74.x`). The matching `@swc/core` upgrade is covered by the `swc_should_be_latest_version.md` task. Run:
   ```
   yarn up @swc/jest
   ```

5. Remove the deprecated type packages. `@testing-library/jest-dom` and `@testing-library/react` now ship their own TypeScript types, so the DefinitelyTyped stub packages are no longer needed. Run:
   ```
   yarn remove @types/testing-library__jest-dom @types/testing-library__react
   ```
