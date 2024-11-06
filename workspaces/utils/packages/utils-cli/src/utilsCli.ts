import pino from 'pino';
import pinoPretty from 'pino-pretty';

type AsyncFunction<O> = () => Promise<O>;

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Interface defining the required logger instance methods
 */
export interface LoggerInstance {
  debug: (obj: object | null | undefined, msg?: string) => void;
  info: (obj: object | null | undefined, msg?: string) => void;
  warn: (obj: object | null | undefined, msg?: string) => void;
  error: (msg: string) => void;
}

/**
 * Configuration options for the logger
 */
export interface LoggerConfig {
  /** Custom logger instance implementing LoggerInstance interface */
  instance?: LoggerInstance;
}

let loggerInstance: LoggerInstance | undefined;

const defaultLogger = pino(
  {
    level: isDebug ? 'debug' : 'info',
    ...(isLambda && {
      timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
      formatters: {
        level: (label: string) => ({ level: label }),
        log: (obj: Record<string, unknown>) => {
          if (obj.err) {
            const err = obj.err as Error;
            return {
              ...obj,
              error: {
                type: err.name,
                stack: err.stack,
                message: err.message,
              },
            };
          }
          return obj;
        },
      },
      base: {
        aws_request_id: process.env.AWS_LAMBDA_REQUEST_ID || undefined,
        function_name: process.env.AWS_LAMBDA_FUNCTION_NAME,
        function_version: process.env.AWS_LAMBDA_FUNCTION_VERSION,
      },
    }),
  },
  isLambda
    ? undefined // Use default JSON transport for Lambda
    : pinoPretty({
        colorize: true,
        hideObject: false,
        colorizeObjects: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
        sync: true, // required for work in Jest see https://github.com/pinojs/pino-pretty?tab=readme-ov-file#usage-with-jest
      })
);

/**
 * Configure the logger instance
 * @param config - Configuration options for the logger
 */
export function configureLogger(config: LoggerConfig): void {
  loggerInstance = config.instance;
}

/**
 * Get the current logger instance
 * @returns The configured logger instance or the default pino logger
 */
export function logger(): LoggerInstance {
  return loggerInstance || defaultLogger;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wrapCli = async (func: AsyncFunction<any>): Promise<void> => {
  try {
    await func();
    process.exit(0);
  } catch (e) {
    if (isDebug) {
      throw e;
    } else {
      console.log('❌ ' + e.message);
      process.exit(1);
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (e: any) => {
  if (isDebug) {
    console.log(e);
  }
  console.log('❌ Unhandled error in asynchronous method:', e.message);
  process.exit(1);
});
