export interface CallToAction {
  title: string;
  link: string;
}

export interface FeatureContent {
  type: string;
  data: any;
}

export interface MoreDetails {
  description: string;
  link?: string;
}

export interface TemplateFeatureProps {
  title: string;
  description: string;
  moreDetails?: MoreDetails;
  callToAction?: CallToAction;
  content: FeatureContent;
  icons?: any[];
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
