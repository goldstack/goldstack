The following key properties need to be configured for this template:

- **Cognito Domain**: The domain on which the identity server and the UI pages for login will be hosted.
- **User Pool Name**: The name for the Cognito User Pool that should be created by this template. Note no User Pool of the same name should exist in your account.
- **Callback URL**: A URL pointing to a page in your applications that users should be redirected after signing in successfully through the Cognito UI.
- **Hosted Zone Domain**: A Route 53 hosted zone to which the _Cognito Domain_ an be added as record. For instance, the hosted zone domain `mysite.com` would allow adding the cognito domain `auth.mysite.com`. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.
