import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Homepage from '../pages/index';

test('Check App component render', () => {
  render(<Homepage />);

  expect(
    screen.getByText('Toggle Data Display', { exact: false })
  ).toBeVisible();
});
