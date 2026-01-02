import { configureLogger, type LoggerConfig, logger } from '@goldstack/utils-cli';

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

export function setLogger(config: LoggerConfig): void {
  configureLogger(config);
}

export function debug(msg: string, properties?: any): void { // biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
  logger().debug(properties, msg);
}

export function info(msg: string, properties?: any): void { // biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
  logger().info(properties, msg);
}

export function warn(msg: string, properties?: any): void { // biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
  logger().warn(properties, msg);
}

export function error(msg: string, properties?: any): void { // biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
  logger().error(properties, msg);
}
export const fatal = (msg: string): void => {
  if (isDebug) {
    throw new Error(msg);
  }
  logger().error({}, msg);
  process.exit(1);
};