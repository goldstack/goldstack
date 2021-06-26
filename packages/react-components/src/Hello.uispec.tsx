import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Hello from './Hello';

test('Check component render', () => {
  render(<Hello />);
  expect(screen.getByText('Hello from component').textContent).toBe(
    'Hello from component'
  );
});
