/* eslint-disable @typescript-eslint/no-var-requires */
import base from './../../jest.config';

import { compileCss } from 'node-css-require';

module.exports = {
  ...base,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  transform: {
    '.+\\.(style|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '.+\\.css$': ['./scripts/cssTransformer.js', {}],
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
};
