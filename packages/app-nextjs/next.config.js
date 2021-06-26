/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
module.exports = (phase, { defaultConfig }) => {
  return {
    dir: './src',
    eslint: {
      // ESLint managed on the workspace level
      ignoreDuringBuilds: true,
    },
    // fixing issues with Next.js default loader and using next export
    // https://github.com/vercel/next.js/issues/21079
    images: {
      loader: 'imgix',
      path: '/',
    },
  };
};
