import React from 'react';
import sitemap from './../data/docs/sitemap.json';
import { SitemapItem } from '@goldstack/markdown-docs';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Navigation from './../components/Navigation';

describe('<Navigation/>', () => {
  it('Should render documentation navigation', async () => {
    const items: SitemapItem[] = sitemap;
    render(<Navigation items={items} currentPath="/"></Navigation>);
    const navElement = await screen.findByText('Next.js');
    expect(navElement).toBeTruthy();
  });
});
