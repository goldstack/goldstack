DOES Not work

### Vercel Deployment

The Goldstack Next.js modules can be deployed to Vercel using the [Vercel CLI](https://vercel.com/download). In order to deploy your project, please follow the following steps:

#### 1. Install Vercel CLI

Install Vercel CLI as global npm package:

```
npm i -g vercel
```

Verify the installation has been successful:

```
vercel --version
```

#### 2. Create a Vercel Account

You need to create a vercel account if you do not have one already. Use your GitHub account to sign up to Vercel.

[https://vercel.com/signup](https://vercel.com/signup)

#### 3. Initialise Vercel

You will need to link your local project to Vercel. For this, run:

```
vercel
```

You will be asked to provide your email address. Use the same email address that is the primary email address of your GitHub account. You should receive a verification link to your email address.

Make sure to go into the directory of the package that contains your Next.js application.
Now run the following:

```
vercel dev
```

Now you are asked to `Set up and develop` the current directory. Verify that this is the directory of your Next.js application. Confirm this with `Y`.

```
λ vercel dev
Vercel CLI 21.2.0 dev (beta) — https://vercel.com/feedback
? Set up and develop “~\repos\goldstack-mega\workspaces\apps\packages\goldstack-home”? [Y/n] y
```

Next you are asked for the scope of your project. This should simply be your GitHub username. Just confirm this with enter.

```
? Which scope should contain your project? mxro
```

You are then asked if you want to link to an existing project. Reply with `N`.

```
? Link to existing project? [y/N] n
```

Provide the name of your project. You can simply use the name of the package you want to deploy.

```
? What’s your project’s name? (goldstack-home) goldstack-home
```

To confirm in which directory your code is located, leave it as the default `./`

```
? In which directory is your code located? ./
```

[It is not possible to deploy a locally built Next.js app to Vercel](https://vercel.com/knowledge/deploying-locally-built-nextjs)
