[%Step-by-step Video Guide](https://www.youtube.com/embed/-lWrkpzEgfs)

The easiest way to configure the AWS user for Goldstack is to do it during project setup by providing an _AWS Access Key Id_ and _AWS Secret Access Key_. To obtain these, please do the following:

- Create an AWS account if you do not already have one. See [instructions on this from AWS here](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).
- Open the AWS console IAM management and sign in if required: https://console.aws.amazon.com/iam/home?region=us-east-1#/home
- Click on _Users_ in the menu on the right

![Add User in AWS console](https://cdn.goldstack.party/img/202010/add_user.png)

- Provide a username of your choice, for instance 'goldstack-dev'
- Select the Access Type _Programmatic Access_

![Provide user details](https://cdn.goldstack.party/img/202410/aws-user-1.png)

- Click on the button _Next: Permissions_
- Select _Attach existing policies directly_

![Attach policy](https://cdn.goldstack.party/img/202410/aws-user-2.png)

- Select the Policy _AdministratorAccess_

![Search for policy](https://cdn.goldstack.party/img/202410/aws-user-policy.png)

- Click on the button _Next_
- On the review page click _Create user_
- Click on the name of the user you have just created
- Then click on the tab _Security credentials_

![Get to security credentials](https://cdn.goldstack.party/img/202410/aws-user-4.png)

- Scroll down to _Access Keys_ and click _Create Access Key_

![Create access key](https://cdn.goldstack.party/img/202410/aws-user-5.png)

- Select _Local code_ and check the box under _Confirmation_, and click _Next_

![Confirm key type](https://cdn.goldstack.party/img/202410/aws-user-6.png)

- You do not need to provide a description tag value. Click _Create access key_.

Now you can copy the _Access Key ID_ and add it to the Goldstack configuration form or add it into your local configuration file. Do the same with the _Secret Access Key_ (It can be shown by clicking on Show).

![Copy ID and key](https://cdn.goldstack.party/img/202410/aws-user-7.png)

Note that it is recommended to only provide this key and secret for development systems (and prototype/hobby production systems). For all other systems, it is recommended to provide this key and secret only through environment variables (see below).
