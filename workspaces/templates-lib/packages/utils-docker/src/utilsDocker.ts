import { sh } from '@goldstack/utils-sh';

export const hasDocker = (): boolean => {
  if (!sh.which('docker')) {
    return false;
  } else {
    return true;
  }
};

export const assertDocker = (): void => {
  if (!sh.which('docker')) {
    throw new Error(
      'Docker must be installed. Please install Docker and ensure the "docker" command is available in your terminal.'
    );
  }

  if (sh.exec('docker version', { silent: true }).code != 0) {
    throw new Error('Docker must be running. Please start the docker service.');
  }
};

const cleanEnvVariableValue = (value: string): string => {
  if (value && value.indexOf('"') > -1) {
    return '';
  }
  if (value && value.indexOf('\\') > -1) {
    return '';
  }
  return value;
};

const GITHUB_ACTIONS_ENV_VARIABLES = [
  'DEPLOYMENT_BASEPATH',
  'USER',
  'npm_config_user_agent'.toLocaleUpperCase(),
  'CI',
  'JAVA_HOME_7_X64',
  'npm_node_execpath'.toLocaleUpperCase(),
  'NODE_AUTH_TOKEN',
  'JAVA_HOME_8_X64',
  'SHLVL',
  'HOME',
  'RUNNER_TEMP',
  'GITHUB_EVENT_PATH',
  'JAVA_HOME_11_X64',
  'GITHUB_REPOSITORY_OWNER',
  'JAVA_HOME_12_X64',
  'GRADLE_HOME',
  'NODE_OPTIONS',
  'AZURE_EXTENSION_DIR',
  'POWERSHELL_DISTRIBUTION_CHANNEL',
  'GOROOT',
  'GOROOT_1_11_X64',
  'BOOST_ROOT_1_72_0',
  'ImageVersion'.toLocaleUpperCase(),
  'GOROOT_1_12_X64',
  'GITHUB_API_URL',
  'SWIFT_PATH',
  'GOROOT_1_13_X64',
  'RUNNER_OS',
  'JOURNAL_STREAM',
  'GOROOT_1_14_X64',
  'CHROMEWEBDRIVER',
  'RUNNER_USER',
  'GITHUB_WORKFLOW',
  'GITHUB_RUN_ID',
  'ImageOS'.toLocaleUpperCase(),
  'BOOST_ROOT_1_69_0',
  'PERFLOG_LOCATION_SETTING',
  'INVOCATION_ID',
  'RUNNER_TOOL_CACHE',
  'RUNNER_TRACKING_ID',
  'NPM_CONFIG_USERCONFIG',
  'ANT_HOME',
  'AGENT_TOOLSDIRECTORY',
  'GITHUB_ACTION',
  'GITHUB_RUN_NUMBER',
  'LANG',
  'VCPKG_INSTALLATION_ROOT',
  'CONDA',
  'GITHUB_REPOSITORY',
  'DEBIAN_FRONTEND',
  'GITHUB_ACTIONS',
  'npm_lifecycle_event'.toLocaleUpperCase(),
  'YARN_IGNORE_CWD',
  'GITHUB_JOB',
  'RUNNER_PERFLOG',
  'GITHUB_WORKSPACE',
  'GITHUB_SHA',
  'ANDROID_SDK_ROOT',
  'GITHUB_ACTOR',
  'GITHUB_REF',
  'LEIN_HOME',
  'JAVA_HOME',
  'PWD',
  'RUNNER_WORKSPACE',
  'BERRY_BIN_FOLDER',
  'ANDROID_HOME',
  'GECKOWEBDRIVER',
  'GITHUB_EVENT_NAME',
  'LEIN_JAR',
  'M2_HOME',
  'CHROME_BIN',
  'SELENIUM_JAR_PATH',
  'INIT_CWD',
  'NODE_ENV',
  'JEST_WORKER_ID',
];

export const renderHostEnvironmentVariables = (): string => {
  return Object.keys(process.env)
    .map((key) => {
      const normKey = key.toLocaleUpperCase();
      if (
        normKey === 'PATH' ||
        normKey === 'PATHEXT' ||
        normKey === 'OS' ||
        normKey === 'NVM_HOME' ||
        normKey === 'NPM_EXECPATH' ||
        normKey === 'NVM_SYMLINK' ||
        normKey === 'HOME' ||
        normKey === 'npm_config_user_agent'.toLocaleUpperCase() ||
        normKey === 'JAVA_HOME_7_X64' ||
        normKey === 'npm_node_execpath'.toLocaleUpperCase() ||
        normKey === 'NODE_OPTIONS' ||
        normKey === 'GOROOT' ||
        GITHUB_ACTIONS_ENV_VARIABLES.indexOf(normKey) > -1
      ) {
        return '';
      }
      const value = process.env[key];

      if (value) {
        const cleanedValue = cleanEnvVariableValue(value);
        if (cleanedValue) {
          return `-e "${key}"="${cleanedValue}" `;
        }
      }
      return '';
    })
    .join('');
};

export const imageGoldstackBuild = (): string =>
  'goldstack/goldstack-docker-build:0.1.3';
