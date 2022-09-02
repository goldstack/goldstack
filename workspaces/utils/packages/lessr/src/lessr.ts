export interface BundledResource {
  name: string;
  path: string;
  content: string;
  mimeType: string;
}

export interface BundleArgs {
  entryPoint: string;
  props: Record<string, unknown>;
}

export interface Bundler<Args extends BundleArgs, RenderArgs> {
  bundle: (args: Args) => Promise<BundledResource[]>;
  renderResource: (
    bundleArgs: Args,
    renderArgs: RenderArgs,
    name: string
  ) => Promise<BundledResource>;
}
