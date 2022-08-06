[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

Note that your website will not work yet. It first needs to be deployed as per instructions below.

[!embed](./../shared/getting-started-deployment.md)

You should now be able to access your website. The domain under which the website is deployed is configured in `goldstack.json` under `"deployments[*].domain"`.

### Development

The entry point for defining new pages and routes is in `src/routes`. The easiest way to get started is to modify or add new pages routes to the server by adding new folders and files. The template will automatically update the infrastructure configuration for the new routes defined, such as adding routes to the API Gateway or defining new Lambda functions.

There are a few things to keep in mind when defining new endpoints:

#### Defining Pages

When defining a new page in the `src/routes` folder by adding a new TypeScript, the following template needs to be followed:

```typescript
import React, { useState } from 'react';

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { renderDocument } from './../_document';
import { renderPage, hydrate } from '@goldstack/template-ssr';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

const Index = (props: { message: string }): JSX.Element => {
  return (
    <>
      <div>{props.message}</div>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  return renderPage({
    component: Index,
    properties: {
      message: 'Hi there',
    },
    entryPoint: __filename,
    event,
    renderDocument,
  });
};

hydrate(Index);

export default Index;
```

Note the file should have the `.tsx` extension.

#### Defining Routes

Routes are defined through the names of folders and source folders within the `src/routes` folder. There are a few rules to keep in mind:

- **Basic Routing**: The names of files is used for the names of resources. For instance, `src/routes/page.tsx` will available under `mypage.com/page`.
- **Subfolders**: Names of folders will be used in the path to resources. For instance, `src/routes/group/page.tsx` will be available under `mypage.com/group/page`.
- **Indices**: For defining a route that matches `/` within a folder (or the root of the website), a source file with the name `$index.tsx` can be defined. For instance, `src/routes/group/$index.tsx` will be available under `api.com/group/`.
- **Default Fallback**: To define a fallback that is called when no route is matched, define a source file with the name `$default.tsx`. There should only be one `$default.tsx` file in the API. This will match all paths that are not covered by other routes.
- **Path Parameters**: Parameters in path are supported using the syntax `{name}`. For instance, `src/user/{name}.tsx` will make the parameter `name` available in the endpoint. Parameters are also supported as folder names.
- **Greedy Paths**: If a parameter should match multiple resource levels, it can be defined as follows `{greedy+}`. For instance `src/group/{greedy+}.tsx` will match `mypage.com/group/1` and `mypage.com/group/some/path` and all other paths under `group/`.

#### Static Resources

Files placed in the following folders will be served as static files for the website:

- `public/`
- `static/`

Files placed in the `static/` folder will automatically be configured to be cached indefinitely by the CloudFront CDN.

Select resources from the `public/` folder will also be served at the root of the website, such as `favicon.ico`.

For details, please check the CloudFront configuration in `infra/aws/cloudfront.ts`.

#### Updating Infrastructure

Note that after defining a new route, the infrastructure will need to be updated using `yarn infra up [deployment name]`. This is because new or changed routes will require changes to the API Gateway and/or the Lambda functions that are defined.

#### Writing Tests

The Goldstack template for this module contains an example of an integration test for the API. Test are easy to write and very fast to run by utilising a [custom Express.js server](https://github.com/goldstack/goldstack/tree/8645bbe9d450acc3b41da2c4cd75db3afc2e8e5b/workspaces/templates-lib/packages/utils-aws-http-api-local). It is also very cheap to create instances of the API on AWS infrastructure; thus more sophisticated setups can run tests directly against the API deployed on AWS.

Here an example for a local test:

```typescript
import getPort from 'find-free-port';
import fetch from 'node-fetch';
import {
  startServer,
  StartServerResult,
} from '@goldstack/utils-aws-http-api-local';

describe('Should create API', () => {
  let port: undefined | number = undefined;
  let server: undefined | StartServerResult = undefined;

  beforeAll(async () => {
    port = await new Promise<number>((resolve, reject) => {
      getPort(
        process.env.TEST_SERVER_PORT || '50321',
        (err: any, p1: number) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(p1);
        }
      );
    });
    server = await startServer({
      port: `${port}`,
      routesDir: './src/routes',
    });
  });

  test('Should receive response and support parameters', async () => {
    const res = await fetch(`http://localhost:${port}/echo?message=abc`);
    const response = await res.json();
    expect(response.message).toContain('abc');
  });

  afterAll(async () => {
    if (server) {
      await server.shutdown();
    }
  });
});
```

#### Best Practices

- **Keep Lambdas Lightweight**: This template will package Lambdas only with the code that they require. Aim to minimise the number of dependencies that are imported into each handler function. The smaller the Lambda functions are, the less noticeable cold starts will be. Cold starts using Lambdas packaged by this module can be as low as 150 ms (with almost all of that time spent on AWS getting the basic infrastructure for the Lambda up and running).
- **Think RESTful**: This module does not limit in any way which kinds of APIs can be created. However, it is often advisable to develop APIs in a RESTful way. For a reference on best practices, see [RESTful web API design by Microsoft](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design).
