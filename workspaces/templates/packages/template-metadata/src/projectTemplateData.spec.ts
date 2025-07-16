import { allTemplates, type MoreDetails } from './projectTemplateData';

describe('Project Template Data', () => {
  it('Should be able to provide types', () => {
    const details: MoreDetails = {
      description: 'My description',
    };
    expect(details.description).toEqual('My description');
  });

  it('Should have valid meta titles and descriptions', () => {
    const allTemplatesData = allTemplates();

    for (const template of allTemplatesData) {
      const props = template;
      if (
        props.metaDescription &&
        (props.metaDescription.length < 120 || props.metaDescription.length > 156)
      ) {
        throw new Error(
          'Meta description must be between 120 and 156 characters. Invalid: ' +
            props.metaDescription,
        );
      }

      if (props.metaTitle && (props.metaTitle.length < 40 || props.metaTitle.length > 60)) {
        throw new Error(
          'Meta title must be between 40 and 60 characters. Invalid: ' + props.metaTitle,
        );
      }
    }
  });
});
