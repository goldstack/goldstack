import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Index from '../routes/$index';

describe('Render tests', () => {
  it('Should render component', () => {
    render(<Index message="run test"></Index>);

    expect(screen.getByText('run test', { exact: false })).toBeVisible();
  });
});
