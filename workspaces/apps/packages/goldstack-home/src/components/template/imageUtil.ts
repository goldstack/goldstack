import type { TemplateFeatureImage } from '@goldstack/template-metadata';
import AWSIcon from './../../icons/aws.svg';
import APIGateway from './../../icons/aws-api-gateway.svg';
import BiomeIcon from './../../icons/biomejs.svg';
import BootstrapIcon from './../../icons/bootstrap.svg';
import ESLintIcon from './../../icons/eslint.svg';
import CompositionIcon from './../../icons/front/icon-29-composition.svg';
import JestIcon from './../../icons/jestjs.svg';
import LambdaIcon from './../../icons/lambda.svg';
import NextjsIcon from './../../icons/nextjs.svg';
import NextjsBootstrapIcon from './../../icons/nextjs_bootstrap.svg';
import NodejsIcon from './../../icons/nodejs.svg';
import ReactIcon from './../../icons/reactjs.svg';
import S3Icon from './../../icons/s3.svg';
import SESIcon from './../../icons/ses2.svg';
import TailwindIcon from './../../icons/tailwind.svg';
import TerraformIcon from './../../icons/terraform.svg';
import TypeScriptIcon from './../../icons/typescript.svg';
import VSCodeIcon from './../../icons/vscode.svg';
import YarnIcon from './../../icons/yarn.svg';

export const resolveImage = (image: TemplateFeatureImage): any => {
  if (image.indexOf('http') === 0) {
    return image;
  }
  if (image === 'typescript') {
    return TypeScriptIcon;
  }
  if (image === 'nextjs') {
    return NextjsIcon;
  }
  if (image === 'nextjs-bootstrap') {
    return NextjsBootstrapIcon;
  }
  if (image === 'nextjs-tailwind') {
    return TailwindIcon;
  }
  if (image === 'biome') {
    return BiomeIcon;
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
  if (image === 'react') {
    return ReactIcon;
  }
  if (image === 'lambda') {
    return LambdaIcon;
  }
  if (image === 'ses') {
    return SESIcon;
  }
  if (image === 's3') {
    return S3Icon;
  }
  if (image === 'api-gateway') {
    return APIGateway;
  }
  throw new Error('Unknown image for template icon: ' + image);
};
