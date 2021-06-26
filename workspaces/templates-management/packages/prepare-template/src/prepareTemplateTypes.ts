export interface PrepareTemplateParams {
  monorepoRoot: string;
  destinationDirectory: string;
  sourceTemplateDirectory: string;
}
export interface PrepareTemplate {
  templateName(): string;
  run(params: PrepareTemplateParams): Promise<void>;
}
