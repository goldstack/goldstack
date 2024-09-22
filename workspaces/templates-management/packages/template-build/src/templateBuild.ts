import {
  PrepareTemplate,
  generateBuilderFromConfig,
} from '@goldstack/prepare-template';
import { PrepareYarnPnpMonorepo } from '@goldstack/prepare-yarn-pnp-monorepo';
import { TemplateRepository } from '@goldstack/template-repository';
import { info } from '@goldstack/utils-log';
import { GoldstackTemplateConfiguration } from '@goldstack/utils-template';

const templateBuilders: PrepareTemplate[] = [new PrepareYarnPnpMonorepo()];

export interface TemplateBuildConfig {
  monorepoRoot: string;
  destinationDirectory?: string;
  templateRepository: TemplateRepository;
}

export const build = async (
  templateName: string,
  config: TemplateBuildConfig
): Promise<GoldstackTemplateConfiguration> => {
  let builder = templateBuilders.find(
    (builder) => templateName === builder.templateName()
  );
  const monorepoRoot = config.monorepoRoot;
  const destinationDirectory =
    config.destinationDirectory + templateName + '/' ||
    `./templates/${templateName}/`;
  const sourceTemplateDirectory =
    monorepoRoot + 'workspaces/templates/packages/' + templateName + '/';

  if (!builder) {
    builder = await generateBuilderFromConfig(sourceTemplateDirectory);
  }

  if (!builder) {
    throw new Error(`Cannot find builder for template ${templateName}`);
  }

  info(
    'Determined template builder from configuration for template ' +
      builder.templateName() +
      ' from folder: ' +
      sourceTemplateDirectory
  );

  info('Building template into ' + destinationDirectory);
  await builder.run({
    monorepoRoot,
    destinationDirectory,
    sourceTemplateDirectory,
  });
  const templateConfig = await config.templateRepository.addTemplateVersion(
    destinationDirectory
  );

  return templateConfig;
};
