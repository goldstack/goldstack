import TemplateFeature from './TemplateFeature';
const ProjectTemplateFeatureDetail = (props) => {
    if (!props.feature.details) {
        return <></>;
    }
    return <TemplateFeature {...props.feature}></TemplateFeature>;
};
const ProjectTemplateFeaturesDetails = (props) => {
    return (<>
      {props.features.map((feature, idx) => {
            return (<ProjectTemplateFeatureDetail key={idx} feature={feature}></ProjectTemplateFeatureDetail>);
        })}
    </>);
};
export default ProjectTemplateFeaturesDetails;
//# sourceMappingURL=ProjectTemplateFeaturesDetails.jsx.map