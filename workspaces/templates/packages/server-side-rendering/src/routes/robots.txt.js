/* esbuild-ignore ui */
import assert from 'assert';
export const handler = async (_event, _context) => {
  assert('Can use Node.js built in functions' !== undefined);
  const response = {
    body: `User-agent: *
${process.env.GOLDSTACK_DEPLOYMENT !== 'prod' ? 'Disallow: /' : ''}`,
    headers: {
      'Content-Type': 'text/plain',
    },
    statusCode: 200,
  };
  // Add cache headers for robots.txt (public content)
  return {
    ...response,
    headers: {
      ...response.headers,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      Vary: 'Accept-Encoding',
    },
  };
};
//# sourceMappingURL=robots.txt.js.map
