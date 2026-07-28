import type { PackageProps, TemplateFeatureImage } from '@goldstack/template-metadata';
interface ProjectTemplateSidebarProps {
  tags: string[];
  image: TemplateFeatureImage;
  packages: PackageProps[];
  isComposite: boolean;
  actionLink: string;
  boilerplateLink?: string;
}
declare const ProjectTemplateSidebar: (props: ProjectTemplateSidebarProps) => React.ReactNode;
export default ProjectTemplateSidebar;
//# sourceMappingURL=ProjectTemplateSidebar.d.ts.map
