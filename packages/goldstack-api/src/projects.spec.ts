import { getMockReq, getMockRes } from '@jest-mock/express';
import {
  postProjectHandler,
  getProjectHandler,
  putProjectHandler,
} from './projects';
import { ProjectConfiguration } from '@goldstack/utils-project';
import { dummyUser } from '@goldstack/auth';

describe('Project Endpoint', () => {
  const { res, clearMockRes } = getMockRes();

  beforeEach(() => {
    jest.setTimeout(20000);
  });

  beforeEach(() => {
    clearMockRes();
  });

  it('Should create, update and read project', async () => {
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
    const req = getMockReq({
      body: config,
      cookies: {
        userToken: dummyUser(),
      },
    });
    await postProjectHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    const resVal = res.json.mock.calls[0][0];
    expect(resVal).toHaveProperty('projectId');

    const projectId = resVal.projectId;
    clearMockRes();

    config.projectName = 'newername';
    const putReq = getMockReq({
      params: {
        projectId,
      },
      cookies: {
        userToken: dummyUser(),
      },
      body: {
        project: config,
      },
    });

    await putProjectHandler(putReq, res);
    const putResVal = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(putResVal).toHaveProperty('result');

    clearMockRes();
    const getReq = getMockReq({
      params: {
        projectId,
      },
      cookies: {
        userToken: dummyUser(),
      },
    });

    await getProjectHandler(getReq, res);
    const getResVal = res.json.mock.calls[0][0];
    expect(getResVal.project).toEqual(config);
    expect(getResVal.project.projectName).toEqual('newername');
    expect(getResVal.packageConfigs).toBeDefined();
  });
});
