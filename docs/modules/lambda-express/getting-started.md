
[!embed](./../shared/getting-started-infrastructure.md)

Note that your API will not work yet. It first needs to be deployed as per instructions below.

[!embed](./../shared/getting-started-deployment.md)

You should now be able to access your API. The domain under which the API is deployed is configured in `goldstack.json` under `"deployments"` and there the property `"apiDomain"`. You can access this API domain with a browser since the default API provided in the template allows for GET requests to the root.

#### Development

The source code for the express server is defined in the `src/` folder. The entry point for defining new routes is in `src/server.ts`. The easiest way to get started extending the API is to modify or add new routes to the server here.