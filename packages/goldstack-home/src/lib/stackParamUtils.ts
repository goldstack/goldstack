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
  if (elements.includes('s3')) {
    res.push('template:s3');
  }
  return res;
};
