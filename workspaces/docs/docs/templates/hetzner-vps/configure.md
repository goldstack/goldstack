The following key properties need to be configured for this template:

- **Location**: The Hetzner location this server should be deployed to. This can be any valid location string without spaces. For instance, if the location `fsn1` is chosen, the server will be deployed to the `fsn1` Hetzner data center. Example pattern: `^[^\s]*`
- **Server Name**: The Hetzner server name that should be used for this server. The name must not contain any spaces. For example, if the server name `my-server` is chosen, the server will be identified as `my-server`. Example pattern: `^[^\s]*`
- **Server Type**: The Hetzner server type that should be used for this server. The server type string must not contain any spaces. For example, `cx11` refers to a small cloud server instance. Example pattern: `^[^\s]*`
- **SSH User Fingerprint** (optional): The SSH fingerprint of the user that should be granted access to the server. This must be a valid SSH fingerprint string, for example, `SHA256:xyz`. Example pattern: `^[^\s]*`
- **Only Allow SSH Access from IP** (optional): The specific IP address from which SSH access is allowed. For instance, setting this to `192.168.1.1` would limit SSH access to that IP address only.
- **Environment Variables** (optional): The environment variables that should be set for the server. Each environment variable consists of a name and a value. For example, a variable with the name `NODE_ENV` and the value `production` can be configured to set the environment to production.

For more details on deployment, refer to the Hetzner server deployment configuration in the Goldstack documentation.
