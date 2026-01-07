import Form from './Form';

export const ConfigForm = (props: {
  // biome-ignore lint/suspicious/noExplicitAny: JSON schema type is complex and varies
  schema: any;
  // biome-ignore lint/suspicious/noExplicitAny: UI schema type is complex and varies
  uiSchema: any;
  data: unknown;
  idx: number;
  onChange: (data: unknown) => void;
}): React.ReactNode => {
  const onChange = ({ formData }: { formData: unknown }): void => {
    // if (!errors || errors.length === 0) {
    props.onChange(formData);
    // }
  };
  // Type assertion for Object.keys since data is unknown
  const dataObj = props.data as Record<string, unknown>;
  return (
    <Form
      // The key property is added to force React to create a new form when the schema changes - otherwise jsonschema form does not load correcty
      key={props.idx}
      id={`form-${props.idx}`}
      name={`form-${props.idx}`}
      idPrefix={`form-${props.idx}`}
      schema={props.schema}
      uiSchema={props.uiSchema}
      liveValidate
      // if no data has been defined yet, set this to undefined so that first view of form will be without validation errors
      formData={Object.keys(dataObj).length > 0 ? props.data : undefined}
      onChange={onChange}
      showErrorList={false}
    >
      <div> </div>
    </Form>
  );
};
