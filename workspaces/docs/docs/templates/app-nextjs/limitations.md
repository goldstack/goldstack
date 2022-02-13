Goldstack's Next.js modules enable deploying Next.js applications to a serverless AWS infrastructure. The advantage of this is that you get a very low cost, highly scalable and enterprise ready deployment for the Next.js application. However, serverless AWS infrastructure is structurally different to deployments on Vercel or deployments as stand alone Node.js applications. Thus there are a couple of limitations to keep in mind when working with this template:

- [API Routes](https://nextjs.org/docs/api-routes/introduction) are not supported. If you need a backend, we recommend adding our [Lambda Express](lambda-express) template to your project.
- When standing up infrastructure for this module, a new certificate will be automatically obtained from AWS Certificate Manager. AWS has a default limit of the number of SSL certificates per account. If you are reaching this limit, you can simply make a service request with AWS to increase it.
- Pre-fetching does not work in some situations, for instance when statically rendering pages using `getStaticPaths`. As a workaround, we recommend not using [Link](https://nextjs.org/docs/api-reference/next/link) components for these routes and instead use vanilla `a` elements.
- Files added to the `public/` folder may not be served correctly. Configure the CloudFront distribution as described [here](#404-not-found-for-files-in-public-folder-1) to make the files available.
- Delay in deploying new dynamic routes. Since dynamic routes are implemented using Lambda@Edge functions, it can take a while for dynamic routes to start working. This is because once a new dynamic routes is added, a new Lambda@Edge function needs to be deployed. You can check the state of the CloudFront distribution in the AWS console. If no new dynamic routes have been added, everything should work as expected directly after the deployment.
- Next.js `<Image>` component is not supported, see [Next.js Image loader](https://nextjs.org/docs/basic-features/image-optimization#loader). Use `img` instead. The project is already set up to use [next-optimized-images](https://github.com/cyrilwanner/next-optimized-images) which you can [configure](https://github.com/cyrilwanner/next-optimized-images#optimization-packages) for optimising various image types.
- Redirect domain configured as CNAME rather than its own bucket and CloudFront distribution due to [this know limitation](https://www.reddit.com/r/aws/comments/7jyisk/https_redirect_on_s3_bucket_access_denied_error/)
- No support for a dynamic route and pages in the same directory. When creating both normal pages and a dynamic route in a directory, the dynamic route will always be loaded first. For instance, given the following two files:

```
[id].tsx
dummy.tsx
```

When accessing `/dummy`, `[id.tsx]` will be loaded. This does not apply to the `index.html`, which will still be loaded correctly under the root `/`.

Workaround:

Place dynamic routes into sub directories, such as:

```
[id]/index.tsx
dummy.tsx
```

There may be other issues in various edge scenarios. If you come across these, [raise an issue](https://github.com/goldstack/goldstack/issues) or contact support.
