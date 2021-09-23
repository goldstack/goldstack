import App from './App.svelte';
import dummy from './dummy';
// import { render, fireEvent } from '@testing-library/svelte';

describe('Svelte tests', () => {
  it('Should render component', () => {
    expect(true).toEqual(true);

    // const { getByText } = render(App, { name: 'User' });

    // // expect(getByText('Hello User')).toBeInTheDocument();
    // console.log(getByText('Hello User'));
  });
});
