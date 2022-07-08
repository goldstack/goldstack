const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = (msg: any): void => {
  if (isDebug) {
    console.log(msg);
  }
};

export const fatal = (msg: string): void => {
  if (isDebug) {
    throw new Error(msg);
  }
  console.log(msg);
  process.exit(1);
};
