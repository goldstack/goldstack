import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Homepage from '../../pages/index';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    isValidating: false,
    mutate: jest.fn(),
  })),
}));

test('Check App component render', () => {
  const res = render(<Homepage />);

  expect(res.getByText('Toggle Data Display', { exact: false })).toBeVisible();
});
