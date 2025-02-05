[!embed](./../shared/getting-started-project.md)

[!embed](./../shared/getting-started-infrastructure.md)

### 3. Development

See below how this template can be used by other packages (for instance within an [Express Server](./../modules/lambda-express)).

```javascript
import { connect, getFromDomain } from 'my-email-send-module';

const ses = await connect();
const fromDomain = await getFromDomain();

await ses
  .sendEmail({
    Destination: { ToAddresses: ['test@test.com'] },
    Message: {
      Subject: { Charset: 'UTF-8', Data: 'Test email' },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: 'This is the message body in text format.',
        },
      },
    },
    Source: 'sender@' + fromDomain,
  })
  .promise();
```

Note it is also possible to add additional files into the `src/` directory of this template. This can be a good place to implement an interface specific to your application needs.

### 4. Apply for Production Access

AWS does not allow sending emails to any address for new accounts and puts SES into 'Sandbox mode'. In order to send emails to any addresses, it is require to apply for production access.

For this, head to:

[AWS Console - SES Home](https://us-west-2.console.aws.amazon.com/ses/home?region=us-west-2#/get-set-up)

Then click the button [Request Production Access]

or alternatively you can go directly to:

[AWS SES - Request Production Access](https://us-west-2.console.aws.amazon.com/ses/home?region=us-west-2#/account/request-production-access)

Then fill in the form and press submit. Your request should be processed within a few days.
