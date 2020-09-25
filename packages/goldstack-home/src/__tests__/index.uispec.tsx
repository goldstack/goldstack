import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Front from '../pages/index';

import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    title: 'purple',
  },
};

test('Check App component render', () => {
  render(
    <ThemeProvider theme={theme}>
      <Front />
    </ThemeProvider>
  );

  expect(screen.getByText('Configure Project', { exact: false })).toBeVisible();
});
