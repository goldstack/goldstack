import { logger } from '@goldstack/utils-cli';

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

export function debug(msg: string): void {
  logger().debug(msg);
}

export function info(msg: string, properties?: { [key: string]: any }): void {
  logger().info(properties, msg);
}

export function warn(msg: string): void {
  logger().warn(msg);
}

export function error(msg: string): void {
  logger().error(msg);
}

export const fatal = (msg: string): void => {
  if (isDebug) {
    throw new Error(msg);
  }
  logger().error(msg);
  process.exit(1);
};
