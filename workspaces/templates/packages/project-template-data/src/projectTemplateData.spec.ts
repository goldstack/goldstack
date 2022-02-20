import { MoreDetails } from './projectTemplateData';

describe('Project Template Data', () => {
  it('Should be able to provide types', () => {
    const details: MoreDetails = {
      description: 'My description',
    };
    expect(details.description).toEqual('My description');
  });
});
