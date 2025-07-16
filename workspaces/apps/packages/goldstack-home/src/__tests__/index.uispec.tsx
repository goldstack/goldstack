import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import type { NextRouter } from 'next/router';

import { ThemeProvider } from 'styled-components';
import Front from '../pages/index';

const theme = {
  colors: {
    title: 'purple',
  },
};

const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  forward: () => {},
  query: {},
  isReady: true,
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  isLocaleDomain: true,
  isPreview: true,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
};

test('Check App component render', () => {
  // see https://github.com/styled-components/styled-components/issues/3731
  const ThemeProviderPatched = ThemeProvider as any;
  render(
    <ThemeProviderPatched theme={theme}>
      <RouterContext.Provider value={{ ...mockRouter }}>
        <Front />
      </RouterContext.Provider>
    </ThemeProviderPatched>,
  );

  // expect(
  //   screen.getByText('Start Building Your Project Now', { exact: false })
  // ).toBeVisible();
});
