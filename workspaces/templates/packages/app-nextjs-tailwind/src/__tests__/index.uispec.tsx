import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Homepage from '../pages/index';

test('Check App component render', () => {
  const res = render(<Homepage />);

  expect(res.getByText('Toggle Data Display', { exact: false })).toBeVisible();
});
