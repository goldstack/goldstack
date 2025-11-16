import { generateBuilderFromConfig, type PrepareTemplate } from '@goldstack/prepare-template';
import { PrepareYarnPnpMonorepo } from '@goldstack/prepare-yarn-pnp-monorepo';
import type { TemplateRepository } from '@goldstack/template-repository';
import { info } from '@goldstack/utils-log';
import type { GoldstackTemplateConfiguration } from '@goldstack/utils-template';
import { join } from 'path';

const templateBuilders: PrepareTemplate[] = [new PrepareYarnPnpMonorepo()];

export interface TemplateBuildConfig {
  monorepoRoot: string;
  destinationDirectory?: string;
  templateRepository: TemplateRepository;
}

export const build = async (
  templateName: string,
  config: TemplateBuildConfig,
): Promise<GoldstackTemplateConfiguration> => {
  let builder = templateBuilders.find((builder) => templateName === builder.templateName());
  const monorepoRoot = config.monorepoRoot.endsWith('/')
    ? config.monorepoRoot
    : config.monorepoRoot + '/';
  const destinationDirectory = config.destinationDirectory
    ? join(config.destinationDirectory, templateName + '/')
    : `./templates/${templateName}/`;
  const sourceTemplateDirectory = join(
    monorepoRoot,
    'workspaces/templates/packages/',
    templateName + '/',
  );

  if (!builder) {
    builder = await generateBuilderFromConfig(sourceTemplateDirectory);
  }

  if (!builder) {
    throw new Error(`Cannot find builder for template ${templateName}`);
  }

  info(`Building template '${builder.templateName()}' in directory ` + destinationDirectory, {
    templateName: builder.templateName(),
    destinationDirectory,
    sourceTemplateDirectory,
  });
  await builder.run({
    monorepoRoot,
    destinationDirectory,
    sourceTemplateDirectory,
  });
  const templateConfig = await config.templateRepository.addTemplateVersion(destinationDirectory);

  return templateConfig;
};
