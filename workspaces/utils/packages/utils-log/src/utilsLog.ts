import { configureLogger, logger, type LoggerConfig } from '@goldstack/utils-cli';

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

export function setLogger(config: LoggerConfig): void {
  configureLogger(config);
}

export function debug(msg: string, properties?: { [key: string]: any }): void {
  logger().debug(properties, msg);
}

export function info(msg: string, properties?: { [key: string]: any }): void {
  logger().info(properties, msg);
}

export function warn(msg: string, properties?: { [key: string]: any }): void {
  logger().warn(properties, msg);
}

export function error(msg: string, properties?: { [key: string]: any }): void {
  logger().error(properties, msg);
}
export const fatal = (msg: string): void => {
  if (isDebug) {
    throw new Error(msg);
  }
  logger().error({}, msg);
  process.exit(1);
};
