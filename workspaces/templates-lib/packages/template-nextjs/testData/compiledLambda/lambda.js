import manifest from './routes-manifest.json';
export const handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const dynamicRoutes = manifest.dynamicRoutes;
    const extension = request.uri.indexOf('.') !== -1 ? request.uri.split('.').pop() : '.html';
    for (const route of dynamicRoutes) {
        if (new RegExp(route.regex).test(request.uri)) {
            request.uri = route.page + extension;
            break;
        }
    }
    if (request.uri.indexOf(extension) === -1) {
        request.uri = request.uri + extension;
    }
    callback(null, request);
};
//# sourceMappingURL=lambda.js.map