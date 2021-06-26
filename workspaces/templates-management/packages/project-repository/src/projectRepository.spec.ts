import { connectProjectRepository } from './projectRepository';
import { ProjectConfiguration } from '@goldstack/utils-project';

import { dummyUser } from '@goldstack/auth';

import assert from 'assert';

describe('Project Repository', () => {
  it('Should be able to create, read and update projects', async () => {
    const repo = await connectProjectRepository();

    const config: ProjectConfiguration = {
      projectName: 'project1',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      owner: dummyUser(),
      packages: [
        {
          packageName: 'static-website-1',
          templateReference: {
            templateName: 'static-website-aws',
          },
        },
      ],
    };

    const id = await repo.addProject(config);
    expect(id).toHaveLength(36);
    config.projectName = 'newname';
    await repo.updateProjectConfiguration(id, config);
    const readConfig = await repo.readProjectConfiguration(id);
    assert(readConfig);
    expect(readConfig.projectName).toEqual('newname');
    expect(readConfig.packages[0].packageName).toEqual('static-website-1');
  });
});
