import { render, screen } from '@testing-library/react';
import sitemap from './../data/docs/sitemap.json';
import '@testing-library/jest-dom';
import Navigation from './../components/Navigation';
describe('<Navigation/>', () => {
    it('Should render documentation navigation', async () => {
        const items = sitemap;
        render(<Navigation items={items} currentPath="/"></Navigation>);
        const navElement = await screen.findByText('Next.js');
        expect(navElement).toBeTruthy();
    });
});
//# sourceMappingURL=Navigation.uispec.jsx.map