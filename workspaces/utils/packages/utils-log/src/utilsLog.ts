import { logger } from '@goldstack/utils-cli';

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

export function debug(msg: string): void {
  logger().debug(msg);
}

export function info(msg: string): void {
  logger().info(msg);
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
