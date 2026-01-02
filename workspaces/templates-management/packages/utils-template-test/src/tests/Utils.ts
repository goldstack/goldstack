const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const retryOperation = (
  operation: () => Promise<any>, // biome-ignore lint/suspicious/noExplicitAny: Generic retry operation needs to accept any return type
  delay: number,
  retries: number,
): Promise<any> =>
  // biome-ignore lint/suspicious/noExplicitAny: Generic retry operation needs to return any type
  new Promise((resolve, reject) => {
    return operation()
      .then(resolve)
      .catch((reason) => {
        if (retries > 0) {
          return wait(delay)
            .then(retryOperation.bind(null, operation, delay, retries - 1))
            .then(resolve)
            .catch(reject);
        }
        return reject(reason);
      });
  });
