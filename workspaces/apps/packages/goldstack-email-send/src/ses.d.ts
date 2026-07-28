import type { SESClient, SendEmailRequest } from '@aws-sdk/client-ses';
export declare const connect: (deploymentName?: string) => Promise<SESClient>;
export declare const getSentEmailRequests: (client: SESClient) => SendEmailRequest[];
export declare const createSESClient: (client?: SESClient) => SESClient;
export declare const getMockedSES: () => SESClient;
export declare const getFromDomain: (deploymentName?: string) => Promise<string>;
//# sourceMappingURL=ses.d.ts.map
