import React from 'react';

import { getTemplateData } from 'src/lib/templateData';
import PackageCard from '../PackageCard';

const FeatureCombineTemplates = (props: {
  templates: string[];
}): JSX.Element => {
  const data = getTemplateData([]).filter(
    (template) =>
      template.packageId && props.templates.indexOf(template.packageId) !== -1
  );
  return (
    <>
      {data.map((templateData, idx) => (
        <div key={idx} className="mb-2">
          <PackageCard
            features={templateData.features}
            alwaysIncluded={true}
            packageDescription={templateData.packageDescription}
            selected={false}
            packageName={templateData.packageName}
            icons={templateData.icons}
          ></PackageCard>
        </div>
      ))}
    </>
  );
};

export default FeatureCombineTemplates;
