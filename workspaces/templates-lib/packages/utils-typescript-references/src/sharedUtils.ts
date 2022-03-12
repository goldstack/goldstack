import fs from 'fs';

export interface PackageData {
  path: string;
  name: string;
}

export function getPackages(cmdRes: string): PackageData[] {
  return cmdRes
    .split('\n')
    .map((line) => {
      if (line.trim() === '') {
        return {
          path: undefined,
          name: undefined,
        };
      }
      const packageData = JSON.parse(line);
      if (packageData.location === '.') {
        return {
          path: undefined,
          name: undefined,
        };
      }
      // ignore packages without TypeScript configuration
      if (!fs.existsSync(`${packageData.location}/tsconfig.json`)) {
        return {
          path: undefined,
          name: undefined,
        };
      }
      return {
        path: packageData.location,
        name: packageData.name,
      };
    })
    .filter((packageData) => packageData.path && packageData.name);
}
