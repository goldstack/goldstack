[!embed](./../shared/getting-started-infrastructure.md)

### Development

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
