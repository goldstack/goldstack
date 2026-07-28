declare var manifest: any;
/**
 * We are using a outdated syntax here, since we are bundling with esbuild and that cannot translate into es5. So
 * we want to make its job as easy as possible.
 *
 * Cloudfront functions likes these strange non-exported handler functions, so that's what we are supplying. Note
 * you can also make this async by adding 'async' before the function declaration.
 */
declare function handler(event: any): any;
//# sourceMappingURL=lambda.d.ts.map
