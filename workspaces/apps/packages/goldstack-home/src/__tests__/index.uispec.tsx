import React from 'react';
import { render } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { NextRouter } from 'next/router';
import '@testing-library/jest-dom';
import Front from '../pages/index';

import { ThemeProvider } from 'styled-components';

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
  render(
    <ThemeProvider theme={theme}>
      <RouterContext.Provider value={{ ...mockRouter }}>
        <Front />
      </RouterContext.Provider>
    </ThemeProvider>
  );

  // expect(
  //   screen.getByText('Start Building Your Project Now', { exact: false })
  // ).toBeVisible();
});
