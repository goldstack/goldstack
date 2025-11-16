import { dummyUser } from '@goldstack/auth';
import type { ProjectConfiguration } from '@goldstack/utils-project';
import request from 'supertest';
import supertestSession from 'supertest-session';
import { app } from './server';

process.env.CORS = 'http://localhost';

jest.setTimeout(35000);

describe('Goldstack API', () => {
  it('Create a project', async () => {
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
    const cookieAccess = {
      domain: 'localhost',
    };
    const session = supertestSession(app, { cookieAccess });
    const sessionRes = await session.post('/sessions').send();
    expect(sessionRes.status).toEqual(200);
    const cookie = session.cookies.find((cookie: any) => cookie.name === 'userToken');
    expect(cookie).toBeDefined();
    // somehow the following requests don't use the cookie unless the domain is set to undefined
    cookie.domain = undefined;

    const res = await session.post('/projects').send(config);
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('projectId');
    const projectId = res.body.projectId;

    config.projectName = 'updated';
    const putRes = await session.put(`/projects/${projectId}`).send({ project: config });
    expect(putRes.status).toEqual(200);

    const invalidRequest = await request(app).get(`/projects/${projectId}`).send();
    expect(invalidRequest.status).toBeGreaterThanOrEqual(400);
    expect(invalidRequest.body).toHaveProperty('errorMessage');

    const getRes = await session.get(`/projects/${projectId}`).send();
    expect(getRes.status).toEqual(200);
    expect(getRes.body.project.projectName).toEqual('updated');
    expect(getRes.body.project.packages).toHaveLength(1);
    expect(getRes.body.packageConfigs).toBeDefined();

    // put package config update
    getRes.body.packageConfigs[0].package.configuration = { dummy: 'hello' };
    getRes.body.packageConfigs[0].package.deployments.push({ name: 'prod' });

    const put2Res = await session.put(`/projects/${projectId}`).send(getRes.body);
    expect(put2Res.status).toEqual(200);

    const get2Res = await session.get(`/projects/${projectId}`).send();
    expect(get2Res.status).toEqual(200);
    expect(get2Res.body.project.projectName).toEqual('updated');
    expect(get2Res.body.project.packages).toHaveLength(1);
    expect(get2Res.body.packageConfigs[0].package.configuration.dummy).toEqual('hello');
    expect(get2Res.body.packageConfigs[0].package.deployments).toHaveLength(1);

    const getDocsRes = await session
      .get(`/projects/${projectId}/docs?doc=template-configure`)
      .send();
    expect(getDocsRes.status).toEqual(200);
    expect(getDocsRes.body[0].package === 'static-website-1');
    expect(getDocsRes.body[0].docs[0].length > 10);
  });
});
