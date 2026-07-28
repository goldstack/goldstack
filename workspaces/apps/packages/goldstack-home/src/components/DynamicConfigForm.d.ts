import type ProjectData from '@goldstack/project-repository/src/types/ProjectData';
import type { ConfigureStep } from 'src/lib/getConfigureSteps';
declare const DynamicConfigForm: (props: {
  currentItem: number;
  configureSteps: ConfigureStep[];
  packageId: string;
  projectData: ProjectData;
  onChange: (data: ProjectData) => void;
  onStepSubmit: (data: ProjectData) => void;
}) => React.ReactNode;
export default DynamicConfigForm;
//# sourceMappingURL=DynamicConfigForm.d.ts.map
