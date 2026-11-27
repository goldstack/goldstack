export const handler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  if (uri === '' || uri === '/') {
    request.uri = '/index.html';
    callback(null, request);
    return;
  }

  if (uri.charAt(uri.length - 1) === '/') {
    if (uri.charAt(uri.length - 2) !== '/') {
      callback(null, {
        status: '308',
        statusDescription: 'Permanent Redirect',
        headers: {
          location: [
            {
              key: 'Location',
              value: `${uri.substring(0, uri.length - 1)}${
                request.querystring ? `?${request.querystring}` : ''
              }`,
            },
          ],
        },
      });
      return;
    }
    callback(null, request);
    return;
  }

  const lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = `${uri}.html`;
  }

  callback(null, request);
};
