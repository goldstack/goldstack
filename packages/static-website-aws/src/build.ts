#!/usr/bin/env node
import {
  getDeploymentConfig,
  AWSStaticWebsiteDeployment,
} from '@goldstack/template-static-website-aws';
import gulp from 'gulp';
import changed from 'gulp-changed';
import replace from 'gulp-replace';

const build = async (args: string[]): Promise<void> => {
  // The config for a selected deployment
  if (args.length < 3) {
    throw new Error(
      'Expected a parameter providing the name of the deployment.'
    );
  }
  const deployment = args[2];
  let deploymentConfig: AWSStaticWebsiteDeployment;
  if (deployment !== 'local') {
    deploymentConfig = getDeploymentConfig(args[2]);
  } else {
    // provide data for local testing here
    deploymentConfig = {
      name: deployment,
      awsRegion: 'us-west-2',
      awsUser: 'dummy',
      configuration: {
        hostedZoneDomain: 'localhost',
        websiteDomain: 'localhost',
        websiteDomainRedirect: 'localhost',
        defaultCacheDuration: 1,
      },
    };
  }
  const source = './web/**/*';
  const destination = './webDist';

  gulp.task('build', () => {
    return gulp
      .src(source)
      .pipe(changed(destination))
      .pipe(replace('{{deployment}}', deploymentConfig.name))
      .pipe(gulp.dest(destination));
  });

  await new Promise((resolve) => {
    gulp.series(['build'])(resolve);
  });
};

build(process.argv);
