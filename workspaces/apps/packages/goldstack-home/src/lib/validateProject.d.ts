import type { ProjectData } from '@goldstack/project-repository';
export interface StepValidation {
  stepName: string;
  valid: boolean;
}
export declare const validateProject: (projectData: ProjectData) => StepValidation[];
//# sourceMappingURL=validateProject.d.ts.map
