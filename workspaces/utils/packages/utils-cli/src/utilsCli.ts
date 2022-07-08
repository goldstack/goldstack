type AsyncFunction<O> = () => Promise<O>;

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

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
