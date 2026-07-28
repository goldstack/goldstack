'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const auth_1 = require('@goldstack/auth');
const template_s3_1 = require('@goldstack/template-s3');
const express_1 = require('@jest-mock/express');
const projects_1 = require('./projects');
jest.setTimeout(600000);
afterAll(() => {
  (0, template_s3_1.resetMockS3)();
});
describe('Project Endpoint', () => {
  const { res, clearMockRes } = (0, express_1.getMockRes)();
  beforeEach(() => {
    clearMockRes();
  });
  it('Should create, update and read project', async () => {
    const config = {
      projectName: 'project1',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      owner: (0, auth_1.dummyUser)(),
      packages: [
        {
          packageName: 'static-website-1',
          templateReference: {
            templateName: 'static-website-aws',
          },
        },
      ],
    };
    const req = (0, express_1.getMockReq)({
      body: config,
      cookies: {
        userToken: (0, auth_1.dummyUser)(),
      },
    });
    await (0, projects_1.postProjectHandler)(req, res);
    expect(res.json).toHaveBeenCalled();
    const resVal = res.json.mock.calls[0][0];
    expect(resVal).toHaveProperty('projectId');
    const projectId = resVal.projectId;
    clearMockRes();
    config.projectName = 'newername';
    const putReq = (0, express_1.getMockReq)({
      params: {
        projectId,
      },
      cookies: {
        userToken: (0, auth_1.dummyUser)(),
      },
      body: {
        project: config,
      },
    });
    await (0, projects_1.putProjectHandler)(putReq, res);
    const putResVal = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(putResVal).toHaveProperty('result');
    clearMockRes();
    const getReq = (0, express_1.getMockReq)({
      params: {
        projectId,
      },
      cookies: {
        userToken: (0, auth_1.dummyUser)(),
      },
    });
    await (0, projects_1.getProjectHandler)(getReq, res);
    const getResVal = res.json.mock.calls[0][0];
    expect(getResVal.project).toEqual(config);
    expect(getResVal.project.projectName).toEqual('newername');
    expect(getResVal.packageConfigs).toBeDefined();
  });
});
//# sourceMappingURL=projects.spec.js.map
