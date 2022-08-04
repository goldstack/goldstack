module.exports = {
  process(sourceText, sourcePath, options) {
    return {
      // TODO: to actual implementation with postcss / css modules
      code: 'exports.default = {};', // options.compileCss(sourceText, sourcePath).js,
    };
  },
};
