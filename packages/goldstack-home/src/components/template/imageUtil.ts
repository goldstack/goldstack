import TypeScriptIcon from './../../icons/typescript.svg';
import NextjsIcon from './../../icons/nextjs.svg';
import ESLintIcon from './../../icons/eslint.svg';
import VSCodeIcon from './../../icons/vscode.svg';
import YarnIcon from './../../icons/yarn.svg';
import AWSIcon from './../../icons/aws.svg';
import TerraformIcon from './../../icons/terraform.svg';
import JestIcon from './../../icons/jestjs.svg';
import CompositionIcon from './../../icons/front/icon-29-composition.svg';
import BootstrapIcon from './../../icons/bootstrap.svg';
import NodejsIcon from './../../icons/nodejs.svg';

import { TemplateFeatureImage } from '@goldstack/project-template-data';

export const resolveImage = (image: TemplateFeatureImage): any => {
  if (image === 'typescript') {
    return TypeScriptIcon;
  }
  if (image === 'nextjs') {
    return NextjsIcon;
  }
  if (image === 'eslint') {
    return ESLintIcon;
  }
  if (image === 'vscode') {
    return VSCodeIcon;
  }
  if (image === 'yarn') {
    return YarnIcon;
  }
  if (image === 'aws') {
    return AWSIcon;
  }
  if (image === 'terraform') {
    return TerraformIcon;
  }
  if (image === 'jest') {
    return JestIcon;
  }
  if (image === 'composition') {
    return CompositionIcon;
  }
  if (image === 'bootstrap') {
    return BootstrapIcon;
  }
  if (image === 'nodejs') {
    return NodejsIcon;
  }

  throw new Error('Unknown image for template icon: ' + image);
};
