import { info } from '@goldstack/utils-log';
import { write } from '@goldstack/utils-sh';
import type { NextjsDeployment } from './types/NextJsPackage';

export const setNextjsEnvironmentVariables = async (
  deployment: NextjsDeployment,
): Promise<void> => {
  const variables = deployment?.configuration.environmentVariables || [];

  variables.push({
    name: 'NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT',
    value: deployment.name,
  });

  info('Set production environment variables', variables);
  const envContent = variables.map((envVar) => `${envVar.name}=${envVar.value}\n`).join('');

  write(envContent, '.env.production');
};
