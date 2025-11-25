This template can be packaged up and deployed to the deployments specified in `goldstack.json`. Note that deployment will only work _after_ the infrastructure for the respective deployment has been stood up. To deploy your package, run the following script:

```bash
yarn deploy [deploymentName]
```

This command supports the flag `--ignore-missing-deployments`. If this is not provided, the command will fail if the deployment does not exist. If the flag is provided, only a warning will be shown. This is useful if not all components of an application are required for all deployments.
