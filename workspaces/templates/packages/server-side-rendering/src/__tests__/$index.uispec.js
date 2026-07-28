import { jsx as _jsx } from 'react/jsx-runtime';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Index from '../routes/$index';
describe('Render tests', () => {
  it('Should render component', () => {
    render(_jsx(Index, { message: 'run test' }));
    expect(screen.getByText('run test', { exact: false })).toBeVisible();
  });
});
//# sourceMappingURL=$index.uispec.js.map
