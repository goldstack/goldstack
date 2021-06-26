/**
 * Name of the project. No spaces or special characters allowed.
 *
 * @title Name
 * @pattern ^[A-Za-z0-9-_]*$
 */
export type ProjectName = string;

/**
 * Name of the template.
 */
export type TempalteName = string;
/**
 * Version of the template.
 */
export type TemplateVersion = string;
/**
 * Name of the package.
 */
export type PackageName = string;
/**
 * Name of the template.
 */
export type TemplateName = string;
/**
 * Version of the template.
 */
export type TemplateVersion1 = string;
/**
 * Packages to be included in the project.
 */
export type Packages = PackageProjectConfiguration[];

/**
 * Template to be used for the project root.
 */
export interface RootTemplateReference {
  templateName: TempalteName;
  templateVersion?: TemplateVersion;
}
/**
 * Configuration for a package to be included.
 */
export interface PackageProjectConfiguration {
  packageName: PackageName;
  /**
   * Reference to the template to be used for the package.
   */
  templateReference: {
    templateName: TemplateName;
    templateVersion?: TemplateVersion1;
  };
}

/**
 * Configuration for a Goldstack project.
 */
export interface ProjectConfiguration {
  projectName: ProjectName;
  rootTemplateReference: RootTemplateReference;
  packages: Packages;
  owner?: string;
  createdAt?: string;
}
