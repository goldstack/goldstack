export const getPackageIds = (elements: string[]): string[] => {
  const res: string[] = [];
  if (elements.includes('nextjs')) {
    res.push('template:app-nextjs');
  }
  if (elements.includes('bootstrap')) {
    res.push('template:app-nextjs-bootstrap');
  }
  if (elements.includes('express') || elements.includes('lambda')) {
    res.push('template:lambda-express');
  }
  if (elements.includes('serverless-api')) {
    res.push('template:serverless-api');
  }
  if (elements.includes('server-side-rendering')) {
    res.push('template:server-side-rendering');
  }
  if (elements.includes('user-management')) {
    res.push('template:user-management');
  }
  if (elements.includes('s3')) {
    res.push('template:s3');
  }
  if (elements.includes('dynamodb')) {
    res.push('template:dynamodb');
  }
  if (elements.includes('static-website')) {
    res.push('template:static-website-aws');
  }
  if (elements.includes('email-send')) {
    res.push('template:email-send');
  }
  if (elements.includes('hetzner-vps')) {
    res.push('template:hetzner-vps');
  }
  if (elements.includes('gin') || elements.includes('go-gin')) {
    res.push('template:lambda-go-gin');
  }
  return res;
};
