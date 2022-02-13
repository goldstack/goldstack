export interface CallToAction {
  title: string;
  link: string;
}

export type FeatureContentType =
  | 'none'
  | 'gif'
  | 'image'
  | 'aws-deployment'
  | 'combine-templates'
  | 'project-install'
  | 'bootstrap';

export interface FeatureContent {
  type: FeatureContentType;
  data: any;
}

export interface MoreDetails {
  description: string;
  link?: string;
}

export type TemplateFeatureImage =
  | 'typescript'
  | 'nextjs'
  | 'eslint'
  | 'vscode'
  | 'yarn'
  | 'aws'
  | 'terraform'
  | 'jest'
  | 'composition'
  | 'bootstrap'
  | 'nodejs'
  | string; // will be resolved as URL if starts with 'http'
export interface ShortTemplateFeature {
  title: string;
  image: TemplateFeatureImage;
  description: string;
  id: string;
  details?: TemplateFeatureProps;
}

export type TemplateIcons = 'eslint' | 'terraform' | 'jest' | 'vscode' | 'yarn';
export interface TemplateFeatureProps {
  title: string;
  id?: string;
  description: string;
  moreDetails?: MoreDetails;
  callToAction?: CallToAction;
  content: FeatureContent;
  icons?: TemplateIcons[];
}

export interface LandingAction {
  title: string;
  link: string;
}

export interface TextSectionProps {
  title: string;
  content: string;
  action?: LandingAction;
}

export interface PackageProps {
  title: string;
  link: string;
}

export interface ProjectTemplateProps {
  title: string;
  id: string;
  /**
   * Whether this template is composed of multiple packages
   */
  isComposite: boolean;
  description: string;
  packages: PackageProps[];
  images: TemplateFeatureImage[];
  longDescription: string;
  tags: string[];
  hero: TextSectionProps;
  features: TemplateFeatureProps[];
  featuresOverview: ShortTemplateFeature[];
}
