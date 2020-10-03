### AccessDenied error when setting up infrastructure

When running `yarn infra up [deploymentName], you may get AccessDenied errors such as the following:

```
Error: error getting S3 Bucket CORS configuration: AccessDenied: Access Denied
        status code: 403, request id: 1Z1VFR1N5RAMFZ9W, host id: mYdqmUJ8Vo+t845tuW9NNYF8WVnKxlbynRAir4BoMKHKB5kcFjM3uiGkJpQAHGHxusa6sHzcazs=
```

There are a number of possible causes for this:

- You may have configured your AWS user incorrectly. Please see [./../../configuration#aws-configuration](AWS Configuration) for details on how to configure your AWS user.
- You may accidently have a Terraform state in your module. That can happen if you create new modules by copy and pasting from an existing module. In this case, delete the following two folders in your module: `infra/aws/.terraform` and `infra/aws/terraform.tfstate.d`. 