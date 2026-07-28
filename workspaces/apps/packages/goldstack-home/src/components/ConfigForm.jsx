import Form from './Form';
export const ConfigForm = (props) => {
    const onChange = ({ formData }) => {
        // if (!errors || errors.length === 0) {
        props.onChange(formData);
        // }
    };
    // Type assertion for Object.keys since data is unknown
    const dataObj = props.data;
    return (<Form 
    // The key property is added to force React to create a new form when the schema changes - otherwise jsonschema form does not load correcty
    key={props.idx} id={`form-${props.idx}`} name={`form-${props.idx}`} idPrefix={`form-${props.idx}`} schema={props.schema} uiSchema={props.uiSchema} liveValidate 
    // if no data has been defined yet, set this to undefined so that first view of form will be without validation errors
    formData={Object.keys(dataObj).length > 0 ? props.data : undefined} onChange={onChange} showErrorList={false}>
      <div> </div>
    </Form>);
};
//# sourceMappingURL=ConfigForm.jsx.map