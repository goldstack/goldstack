'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.retryOperation = void 0;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const retryOperation = (operation, delay, retries) =>
  new Promise((resolve, reject) => {
    return operation()
      .then(resolve)
      .catch((reason) => {
        if (retries > 0) {
          return wait(delay)
            .then(() => (0, exports.retryOperation)(operation, delay, retries - 1))
            .then(resolve)
            .catch(reject);
        }
        return reject(reason);
      });
  });
exports.retryOperation = retryOperation;
//# sourceMappingURL=Utils.js.map
