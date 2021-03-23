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

export type TemplateIcons = 'eslint' | 'terraform';
export interface TemplateFeatureProps {
  title: string;
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

export interface ProjectTemplateProps {
  title: string;
  description: string;
  hero: TextSectionProps;
  features: TemplateFeatureProps[];
}
