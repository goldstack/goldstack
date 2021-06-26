import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('Check App component render', () => {
  render(<App />);

  expect(screen.getByText('homepage', { exact: false })).toBeVisible();
});
