### Vercel Deployment

The Goldstack Next.js modules can easily be deployed to Vercel.

#### 1. Sign Up to Vercel

You need to create a vercel account if you do not have one already. Use your GitHub account to sign up to Vercel. Your project must be defined in a GitHub repository on this account.

[https://vercel.com/signup](https://vercel.com/signup)

#### 2. Configure Project

Click on [New Project](https://vercel.com/new) on the Vercel dashboard to create a new project.

![Vercel New Project](https://cdn.goldstack.party/img/202101/vercel_new_project.png)

Grant Vercel access to the GitHub repository you want to deploy.

Then click on `Import` to import this repository.

![Vercel Import Project](https://cdn.goldstack.party/img/202101/vercel_import.png)

Add the project to your personal account. Select the **root directory** of your project as the source code to import (not the directory of the package with the Next.js application).

Click to extend _Build and Output Settings_ and provide the following build command:

```
yarn && yarn build && cd packages/app-nextjs-bootstrap && yarn build:next
```

Also change the output directory:

```
packages/app-nextjs-bootstrap/webDist
```

Ensure to replace `app-nextjs-bootstrap` with the name to the Next.js package you want to deploy in the two values above.

Provide environment variables if you have defined any.

![Vercel Build Commands](https://cdn.goldstack.party/img/202101/vercel_build_commands.png)

Click **Deploy** to trigger the deployment. Your application should now be deployed under a `vercel.app`domain.

For more information, see the [Vercel Documentation](https://vercel.com/docs).
