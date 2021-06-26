import { write } from '@goldstack/utils-sh';
import { NextjsDeployment } from './types/NextJsPackage';

export const setNextjsEnvironmentVariables = async (
  deployment: NextjsDeployment
): Promise<void> => {
  const vars = deployment?.configuration.environmentVariables || [];

  vars.push({
    name: 'NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT',
    value: deployment.name,
  });

  console.log('Set production environment variables', vars);
  const envContent = vars
    .map((envVar) => `${envVar.name}=${envVar.value}\n`)
    .join('');

  write(envContent, '.env.production');
};
