/**
 * Starts a test server for local development and testing.
 *
 * @param port - Optional port number to start the server on. Defaults to 5054.
 * @returns A promise that resolves with the test server instance.
 */
export declare const startTestServer: (port?: number) => Promise<any>;
/**
 * Stops the test server if it's running.
 *
 * @returns A promise that resolves when the server has been stopped.
 */
export declare const stopTestServer: () => Promise<void>;
/**
 * Gets the endpoint URL for the API deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns The endpoint URL string.
 * @throws {Error} If the deployment cannot be found.
 */
export declare const getEndpoint: (deploymentName?: string) => string;
//# sourceMappingURL=module.d.ts.map
