
[!embed](./../shared/getting-started-infrastructure.md)

Note that you will not be able to access your website yet. First run a deployment as described below.

[!embed](./../shared/getting-started-deployment.md)

You should now be able to view your website on the domain name you have configured. You can find the domain name in `goldstack.json` under `"deployments"` and there the property `"websiteDomain"` for your selected deployment.

#### Development

This module allows publishing simple static websites. You can start developing your website by modifying the files in the `web/` folder or copy and paste the files of an existing website in there. The module will deploy all files from this folder to the AWS infrastructure.

