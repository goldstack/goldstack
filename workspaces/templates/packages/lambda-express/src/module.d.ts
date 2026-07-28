/**
 * Starts a test server for local development and testing of Express.js applications.
 *
 * @param port - The port number to start the server on.
 * @returns {Promise<void>} A promise that resolves when the server has started.
 */
export declare const startTestServer: (port: number) => Promise<void>;
/**
 * Stops the test server if it's running.
 *
 * @returns {Promise<void>} A promise that resolves when the server has been stopped.
 */
export declare const stopTestServer: () => Promise<void>;
/**
 * Gets the endpoint URL for the Express.js Lambda deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns The endpoint URL string.
 * * @returns {string} The endpoint URL for the Express.js Lambda deployment.
 *
 * @throws {Error} If the deployment cannot be found.
 */
export declare const getEndpoint: (deploymentName?: string) => string;
//# sourceMappingURL=module.d.ts.map
