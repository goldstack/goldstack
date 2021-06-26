# Static Website AWS

## Notes on the Terraform Modules

This module is originally based on [cloudmaniac/terraform-aws-static-website](https://github.com/cloudmaniac/terraform-aws-static-website) but has been simplified in numerous ways:

- The original module was designed to keep the originating S3 bucket private. This results in a number of complexities in the setup, such as the need to provide a lambda to deal with requests to root pages in folders other than the root (e.g. redirect `/about/` to `/about/index.html`) and the need to a special access policy to allow CloudFront access to the S3 bucket. In this module, the S3 buckets are publically accessible which allowed removing several components from the infrastructure.
- The original module supported logging each request into a separate log bucket. This has been disabled, assuming that most website analytics will be implemented using client-side solutions such as Google Analytics.
- The original module did not support providing a default cache duration and always used 300 seconds. A variable has been added to support different values.

Configuration for redirect inspired by [S3 Website Complete Setup](https://www.portzeroventures.com/blog/s3-website-complete-setup/).
