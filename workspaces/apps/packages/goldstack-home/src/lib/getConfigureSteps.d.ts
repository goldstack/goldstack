import type { ProjectData } from '@goldstack/project-repository';
export interface ConfigureStepSection {
  title?: string;
  schema?: any;
  uiSchema: any;
  getData(projectData: ProjectData): any;
  writeData(projectData: ProjectData, newData: any): ProjectData;
}
export interface ConfigureStep {
  title: string;
  type: string;
  docs: string | undefined;
  idx: number;
  id: string;
  sections: ConfigureStepSection[];
}
interface TemplateDocsData {
  doc: string;
  html: string;
}
export interface DocsData {
  package: string;
  docs: TemplateDocsData[];
}
interface ConfigureStepParams extends ProjectData {
  docs: DocsData[] | undefined;
}
export declare const getConfigureSteps: (params: ConfigureStepParams) => ConfigureStep[];
export {};
//# sourceMappingURL=getConfigureSteps.d.ts.map
