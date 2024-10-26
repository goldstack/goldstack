/**
 * Returns the names of module templates. This must match their directory name in workspaces/templates/packages/[name]
 */
export const getModuleTemplatesNames = (): string[] => {
  return [
    'static-website-aws',
    'app-nextjs',
    'app-nextjs-bootstrap',
    's3',
    'dynamodb',
    'docker-image-aws',
    'lambda-go-gin',
    'lambda-python-job',
    'lambda-node-trigger',
    'email-send',
    'lambda-express',
    'serverless-api',
    'user-management',
    'server-side-rendering',
    'hetzner-vps',
  ];
};
