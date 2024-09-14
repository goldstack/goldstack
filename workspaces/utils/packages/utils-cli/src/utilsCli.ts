import pino from 'pino';
import pinoPretty from 'pino-pretty';

type AsyncFunction<O> = () => Promise<O>;

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

const loggerVar = pino(
  { level: isDebug ? 'debug' : 'info' },
  pinoPretty({
    colorize: true,
    hideObject: false,
    colorizeObjects: true,
    translateTime: 'HH:MM:ss',
    ignore: 'pid,hostname',
    singleLine: false,
    sync: true, // requires for work in Jest see https://github.com/pinojs/pino-pretty?tab=readme-ov-file#usage-with-jest
  })
);

export function logger() {
  return loggerVar;
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
