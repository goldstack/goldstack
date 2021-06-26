import { renderTestResults } from './templateBuildSet';

describe('Template build set', () => {
  it('Should render test results', () => {
    const renderedResults = renderTestResults([
      {
        testName: 'one',
        result: true,
        error: undefined,
      },
      {
        testName: 'two fail',
        result: false,
        error: 'Something went wrong.',
      },
    ]);
    expect(renderedResults).toContain('Success');
    expect(renderedResults).toContain('Something went wrong.');
  });
});
