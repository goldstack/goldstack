
import Form from './Form';

export const ConfigForm = (props: {
  schema: any;
  uiSchema: any;
  data: any;
  idx: number;
  onChange: (data: any) => void;
}): JSX.Element => {
  const onChange = ({ formData }): void => {
    // if (!errors || errors.length === 0) {
    props.onChange(formData);
    // }
  };
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
      formData={Object.keys(props.data).length > 0 ? props.data : undefined}
      onChange={onChange}
      showErrorList={false}
    >
      <div> </div>
    </Form>
  );
};