import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Homepage from '../pages/index';

import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    title: 'purple',
  },
};

test('Check App component render', () => {
  render(
    <ThemeProvider theme={theme}>
      <Homepage />
    </ThemeProvider>
  );

  expect(
    screen.getByText('Toggle Data Display', { exact: false })
  ).toBeVisible();
});
