import { render } from '@testing-library/react';
import Homepage from '../../pages';
import '@testing-library/jest-dom';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    isValidating: false,
    mutate: jest.fn(),
  })),
  mutate: jest.fn(),
}));

test('Check App component render', async () => {
  const res = render(<Homepage />);

  expect((await res.findAllByText(/toggle data display/i)).length).toBeGreaterThan(0);
});
