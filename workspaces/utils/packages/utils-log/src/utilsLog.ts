import { configureLogger, type LoggerConfig, logger } from '@goldstack/utils-cli';

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

export function setLogger(config: LoggerConfig): void {
  configureLogger(config);
}

// biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
export function debug(msg: string, properties?: any): void {
  logger().debug(properties, msg);
}

// biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
export function info(msg: string, properties?: any): void {
  logger().info(properties, msg);
}

// biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
export function warn(msg: string, properties?: any): void {
  logger().warn(properties, msg);
}

// biome-ignore lint/suspicious/noExplicitAny: Logger needs to accept any type for properties
export function error(msg: string, properties?: any): void {
  logger().error(properties, msg);
}
export const fatal = (msg: string): void => {
  if (isDebug) {
    throw new Error(msg);
  }
  logger().error({}, msg);
  process.exit(1);
};
