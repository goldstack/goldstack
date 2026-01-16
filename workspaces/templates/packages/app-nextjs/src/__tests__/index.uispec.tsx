import { render } from '@testing-library/react';
import Homepage from '../../pages';
import '@testing-library/jest-dom';

test('Check App component render', async () => {
  const res = render(<Homepage />);

  expect((await res.findAllByText(/toggle data display/i)).length).toBeGreaterThan(0);
});
