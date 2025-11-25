[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

Note you will want to combine this template with another template to host a UI and provide a web server. We recommend to use the [react-ssr template](https://goldstack.party/templates/server-side-rendering).

### 3. Apply Branding to UI

When deploying the infrastructure out of the box, the interface for the login flow is very basic.

It is very tricky to improve this design using the UI, so we recommend that you customise the styling through the Cognito Web interface on the AWS console.

This also generally applies for this template - make changes through the console, since that is safer.

The AWS documentation provides a good starting point for customising the styling:

[Apply branding to managed login pages](https://docs.aws.amazon.com/cognito/latest/developerguide/managed-login-branding.html)

By default, this template will deploy a 'Hosted UI', so the first thing you would want to do is switch to the 'Managed login'.

This is how you can do that:

- Head to Cognito in the AWS console
- On the side menu select 'Branding / Domain' 
- In the 'Custom Domain' section click [Edit] and the 'Edit custom domain branding version'
- Then switch to 'Managed login - Recommended'
- Click [Save changes]

Now we can start doing the styling:

- On the side menu select 'Branding / Managed login'
- Then scroll down to 'Styles'
- Click [Create a style]
- Select your app client
- Click [Create]

You can start customising your styling from here, please see the [AWS Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/managed-login-branding.html) on how to do that.


### 4. Development (Client)

This template will be most useful when combined with a templates that provide a user interface and API. For any UI and API modules in your project that require authentication, add the `user-management` package to their dependencies:

```
yarn add user-management
```

In UI modules, you can use the `loginWithRedirect` method to force user authentication and obtain the access and id tokens for the user:

```typescript
import {
  getLoggedInUser,
  handleRedirectCallback,
  loginWithRedirect,
} from 'user-management';

const Index = (props: { message: string }): JSX.Element => {
  const user = getLoggedInUser();
  handleRedirectCallback();
  return (
    <>
      {!user && (
        <button
          onClick={() => {
            loginWithRedirect();
          }}
        >
          Login
        </button>
      )}
    </>
  );
};
```

`loginWithRedirect` will redirect the user to the sign in page if required. The method `handleRedirectCallback` will automatically obtain the access and id token and set the cookies `goldstack_access_token` and `goldstack_id_token` that will be included in all server requests.

Authentication also involves requesting a refresh token. The refresh token will be kept in an in-memory variable and will be used to require a new access and id token if the existing ones are expired.

Note during the sign in process, the user will always be redirected to the callback URL you specified during configuration after a successful sign in.

The library also supports logging out users. For this, simply call the method `performLogout`. The user will be redirected to the Cognito hosted UI sign in screen.

```typescript
import { performLogout } from '@goldstack/user-management';

async function logoutUser() {
  await performLogout();
}
```

### 5. Development (Server)

If you want to validate if calls to an API have been made by authenticated users, add the `user-management` module to the dependencies of the server-side module:

```
yarn add user-management
```

On the server, we can validate the tokens send by the client using the `connectWithCognito` method:

For full example, see [SSR Example](https://github.com/goldstack/cognito-react-nodejs-example/blob/master/packages/server-side-rendering/src/routes/%24index.tsx#L124)

```typescript
import { connectWithCognito } from 'user-management';

export const handler: SSRHandler = async (event, context) => {
  const cookies = getCookies((event.cookies || []).join(';'));
  if (cookies.goldstack_access_token) {
    const cognito = await connectWithCognito();
    await cognito.validate(cookies.goldstack_access_token);
    const idToken = await cognito.validateIdToken(cookies.goldstack_id_token);
    message = `Hello ${idToken.email}<br>`;
    userId = idToken['custom:app_user_id'];
  }
};
```

Note that it is recommended we [always](https://auth0.com/blog/id-token-access-token-what-is-the-difference/) validate the _access token_. We validate the _id token_ in the above as well to determine the user's email address, since the access token only contains the _username_, which in our case is a cognito generated id.

This template is not designed to support authorization. If you have authorization needs, consider implementing this with [DynamoDB](https://build.diligent.com/fast-authorization-with-dynamodb-cd1f133437e3) using the [DynamoDB template](https://goldstack.party/templates/dynamodb).

Note that while Cognito creates a unique ID for every user (attribute `sub`) it is not recommended to use this ID in your own data. Since, if you accidentally delete the Cognito user pool (Pro tip: Don't do this!!!), you cannot restore this ID. Instead, use the custom attribute created by the template:

```
custom:app_user_id
```

Store this id along with the users email address (and any other critical information you collect through Cognito) in your own database. This will protect you against using the Cognito User pool (though in that event your users would need to set new passwords and also set up their 2FA again).
