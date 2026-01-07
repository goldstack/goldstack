import type { ShortTemplateFeature, TemplateIcons } from '@goldstack/template-metadata';
import React from 'react';
import LearnMore from 'src/components/LearnMore';
import FeatureAWSDeployment from 'src/components/template/FeatureAWSDeployment';
import FeatureCombineTemplates from 'src/components/template/FeatureCombineTemplates';
import FeatureProjectInstall from 'src/components/template/FeatureProjectInstall';
import Plus from 'src/icons/font-awesome/solid/plus.svg';
import EndpointTypeScript from 'src/img/endpoint_typescript.png';
import LambdaConfigImg from 'src/img/lambda_config.png';
import NextJsConfigGif from 'src/img/nextjs-config.gif';
import ReactTypeScriptGif from 'src/img/react-typescript.gif';
import EmailSendImg from 'src/img/ses_email_send.png';
import VercelDeployedImg from 'src/img/vercel_deployed.png';
import { dataUriToSrc } from 'src/utils/utils';
import FeatureBootstrap from './FeatureBootstrap';
import FeatureTailwind from './FeatureTailwind';
import { resolveImage } from './imageUtil';
import styles from './TemplateFeature.module.css';

const IconList = (props: { icons: TemplateIcons[] }): JSX.Element => {
  const images = props.icons.map((icon) => resolveImage(icon));
  return (
    <div className="row justify-content-center">
      {images.map((image, idx) => (
        <div className={'col-4 col-sm-3 my-2 '} key={idx}>
          <img src={image} className={styles.icon} />
        </div>
      ))}
    </div>
  );
};

const createGif = (gif: string): React.ReactNode => {
  if (gif.indexOf('https://') === 0) {
    return <img src={gif} className="img-fluid" />;
  }
  if (gif === 'nextjs-config') {
    // biome-ignore lint/suspicious/noExplicitAny: SVG import requires type assertion
    return <img src={NextJsConfigGif as any}></img>;
  }
  if (gif === 'react-typescript') {
    // biome-ignore lint/suspicious/noExplicitAny: SVG import requires type assertion
    return <img src={ReactTypeScriptGif as any}></img>;
  }
  throw new Error(`Unknown gif ${gif}`);
};

const createImage = (image: string): React.ReactNode => {
  if (image.indexOf('http') === 0) {
    return <img src={image} className="img-fluid"></img>;
  }
  if (image === 'vercel-deployed') {
    // biome-ignore lint/suspicious/noExplicitAny: PNG import requires type assertion
    return <img src={VercelDeployedImg as any} className="img-fluid"></img>;
  }
  if (image === 'endpoint-typescript') {
    // biome-ignore lint/suspicious/noExplicitAny: PNG import requires type assertion
    return <img src={EndpointTypeScript as any} className="img-fluid"></img>;
  }
  if (image === 'lambda-config') {
    // biome-ignore lint/suspicious/noExplicitAny: PNG import requires type assertion
    return <img src={LambdaConfigImg as any} className="img-fluid"></img>;
  }
  if (image === 'email-send') {
    // biome-ignore lint/suspicious/noExplicitAny: PNG import requires type assertion
    return <img src={EmailSendImg as any} className="img-fluid"></img>;
  }
  throw new Error(`Unknown image for feature details ${image}`);
};

const TemplateFeature = (props: ShortTemplateFeature): JSX.Element => {
  if (!props.details) {
    return <></>;
  }
  const details = props.details;
  const plusSvg = dataUriToSrc(Plus);

  let content: React.ReactNode;
  switch (details.content.type) {
    case 'none': {
      content = <></>;
      break;
    }
    case 'gif': {
      content = createGif(details.content.data.gif);
      break;
    }
    case 'image': {
      if (!details.content.data.image) {
        throw new Error(`Invalid data for image ${JSON.stringify(details.content)}`);
      }
      content = createImage(details.content.data.image);
      break;
    }
    case 'aws-deployment': {
      content = <FeatureAWSDeployment></FeatureAWSDeployment>;
      break;
    }
    case 'combine-templates': {
      content = (
        <FeatureCombineTemplates
          templates={details.content.data.templates}
        ></FeatureCombineTemplates>
      );
      break;
    }
    case 'project-install': {
      content = (
        <FeatureProjectInstall
          projectName={details.content.data.projectName}
        ></FeatureProjectInstall>
      );
      break;
    }
    case 'bootstrap': {
      content = <FeatureBootstrap></FeatureBootstrap>;
      break;
    }
    case 'tailwind': {
      content = <FeatureTailwind></FeatureTailwind>;
      break;
    }
    default: {
      throw new Error(`Unknown feature content type ${details.content.type}`);
    }
  }

  return (
    <div className="position-relative gradient-y-gray">
      <div className="container space-2 space-bottom-sm-3">
        <div className="w-md-80 w-lg-50 text-center mx-md-auto mb-5 mb-md-5">
          <div id={props.id || ''}>
            <span
              className="d-block small font-weight-bold text-cap mb-2"
              style={{ cursor: 'pointer' }}
              onClick={() => window.history.back()}
            >
              {props.title} ⤴
            </span>
          </div>
          <h2>{details.title}</h2>
          <p>{details.description}</p>
        </div>

        <div className=" text-center mx-md-auto mb-5 mb-md-5">
          {content}
          {details.moreDetails && (
            <div className="w-md-80 w-lg-50 mx-md-auto text-center">
              <LearnMore {...details.moreDetails}></LearnMore>
            </div>
          )}

          {details.icons && <IconList icons={details.icons}></IconList>}
        </div>

        {details.callToAction && (
          <div className="text-center">
            <a
              className="btn btn-primary transition-3d-hover px-lg-7"
              href={details.callToAction.link}
              // target="_blank"
              // rel="noreferrer"
            >
              <span
                className={styles['plus-icon']}
                dangerouslySetInnerHTML={{ __html: plusSvg }}
              ></span>{' '}
              {details.callToAction.title}
            </a>
          </div>
        )}
      </div>

      <figure className="position-absolute bottom-0 right-0 left-0">
        <svg
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 1920 100.1"
        >
          <path fill="#fff" d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z" />
        </svg>
      </figure>
    </div>
  );
};

export default TemplateFeature;
