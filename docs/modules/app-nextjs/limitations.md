This module enables deploying Next.js applications to a serverless AWS infrastructure. The advantage of this is that you get a very low cost, highly scalable and enterprise ready deployment for the Next.js application. However, serverless AWS infrastructure is structurally different to deployments on Vercel or deployments as stand alone Node.js applications. Thus there are a couple of limitations to keep in mind when working with this template:

- [API Routes](https://nextjs.org/docs/api-routes/introduction) are not supported. If you need a backend, we recommend adding our [Lambda Express](lambda-express) template to your project.
- Pre-fetching does not work in some situations, for instance when statically rendering pages using `getStaticPaths`. As a workaround, we recommend not using [Link](https://nextjs.org/docs/api-reference/next/link) components for these routes and instead use vanilla `a` elements.
- Files added to the `public/` folder may not be served correctly. Configure the CloudFront distribution as described [here](#404-not-found-for-files-in-public-folder-1) to make the files available.

There may be other issues in various edge scenarios. If you come across these, [raise an issue](https://github.com/goldstack/goldstack/issues) or contact support.
