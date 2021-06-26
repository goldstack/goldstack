import {
  getDeploymentConfig,
  AWSStaticWebsiteDeployment,
} from '@goldstack/template-static-website-aws';
import gulp, { Gulp } from 'gulp';
import changed from 'gulp-changed';
import replace from 'gulp-replace';

export const init = async (args: string[]): Promise<Gulp> => {
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
  const destination = './webDist';

  const source = './web/**/*';
  function build(): NodeJS.ReadWriteStream {
    return gulp
      .src(source, { since: gulp.lastRun(build) })
      .pipe(changed(destination))
      .pipe(replace('{{deployment}}', deploymentConfig.name))
      .pipe(gulp.dest(destination));
  }

  gulp.task('build', () => {
    return build();
  });
  gulp.task('watch', () => {
    return gulp.watch(source, build);
  });
  return gulp;
};
