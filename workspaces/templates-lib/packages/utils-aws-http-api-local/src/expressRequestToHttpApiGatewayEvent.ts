import type { LambdaConfig } from '@goldstack/utils-aws-lambda';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';

import cookie from 'cookie';
import type { Request, Response } from 'express';

export interface CovertToGatewayEventParams {
  req: Request;
  lambdaConfig: LambdaConfig;
}

export interface StringMap {
  [key: string]: string;
}

export const sortPropertiesByAppearanceInPath = (
  params: CovertToGatewayEventParams,
  pathParams: StringMap,
): [string, string][] => {
  const pathElements = Object.entries(pathParams)
    .filter((e) => e[0] !== '0')
    .sort((a, b) => {
      return params.lambdaConfig.path.indexOf(a[0]) - params.lambdaConfig.path.indexOf(b[0]);
    });
  return pathElements;
};

export const convertToGatewayEvent = (
  params: CovertToGatewayEventParams,
): APIGatewayProxyEventV2 => {
  const incomingHeaders = params.req.headers;

  const normalisedHeaders = Object.entries(incomingHeaders).reduce(
    (prev: { [key: string]: string }, curr) => {
      if (typeof curr[1] === 'string') {
        prev[curr[0]] = curr[1];
        return prev;
      } else if (curr[1]) {
        prev[curr[0]] = curr[1].join(',');
        return prev;
      }
      return prev;
    },
    {},
  );

  const expressQuery = params.req.query;
  const lambdaQuery = Object.entries(expressQuery)
    .map((e) => `${e[0]}=${e[1]}`)
    .join('&');

  const queryStringParameters = Object.entries(expressQuery).reduce((prev, curr) => {
    if (typeof curr[1] === 'string') {
      prev[curr[0]] = curr[1];
    } else {
      prev[curr[0]] = (curr[1] as string[]).join(',');
    }
    return prev;
  }, {});

  const pathParams = { ...params.req.params };
  // some complicated stuff happening
  // if there was a regex/ greedy path match
  // since express does not provide the full path
  // but rather the 'matches' of the regex
  if (pathParams['0']) {
    const sortedPathParams = sortPropertiesByAppearanceInPath(params, pathParams);
    if (sortedPathParams.length > 0) {
      const lastPathParam = sortedPathParams[sortedPathParams.length - 1];
      const lastPathParamObject = Object.entries(pathParams).find((e) => {
        return e[0].indexOf(lastPathParam[0]) === 0;
      });
      if (lastPathParamObject) {
        // here we append the regex match to the path
        // so the path is the full path that was matched
        pathParams[lastPathParamObject[0]] = `${lastPathParamObject[1]}${pathParams['0']}`;
      }
    }
  }
  return {
    version: '2.0',
    routeKey: params.lambdaConfig.route, // 'ANY /echo',
    rawPath: params.req.url.split('?')[0], // '/echo',
    rawQueryString: lambdaQuery,
    queryStringParameters,
    pathParameters: pathParams,
    cookies: params.req.cookies || normalisedHeaders.cookie?.split(';'), // ['dummyid=730dd32a-4adf-464e-8097-6f03aac71c7ca14a4a'],
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,de;q=0.8',
      'content-length': '0',
      dnt: '1',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      'x-amzn-trace-id': 'Root=1-61ce5e14-5d8a4b4e22d2e69f3af9eb20',
      'x-forwarded-for': '120.148.16.26',
      'x-forwarded-port': '443',
      'x-forwarded-proto': 'https',
      ...normalisedHeaders,
    },
    requestContext: {
      accountId: '111111128371',
      apiId: 'd5811h14p0',
      domainName: 'localhost',
      domainPrefix: 'localhost',
      http: {
        method: params.req.method,
        path: params.req.url,
        protocol: 'HTTP/1.1',
        sourceIp: '120.148.16.26',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      },
      requestId: 'LMOjOiBiPHcEMkQ=',
      routeKey: params.lambdaConfig.route, // 'ANY /echo',
      stage: '$default',
      time: '31/Dec/2021:01:34:12 +0000',
      timeEpoch: Date.now(),
    },
    isBase64Encoded: false,
    body: JSON.stringify(params.req.body),
  };
};

export interface CreateContextParams {
  functionName: string;
}

export const createContext = (params: CreateContextParams): Context => {
  return {
    callbackWaitsForEmptyEventLoop: true,
    getRemainingTimeInMillis: () => {
      return 0;
    },
    done: () => {},
    fail: () => {},
    succeed: () => {},
    functionVersion: '$LATEST',
    functionName: params.functionName,
    memoryLimitInMB: '2048',
    logGroupName: `/aws/lambda/${params.functionName}`,
    logStreamName: '2021/12/31/[$LATEST]11f0a4a770034f1c822a5c4c69490bb1',
    invokedFunctionArn: `arn:aws:lambda:us-west-2:475629728374:function:${params.functionName}`,
    awsRequestId: '8bb853aa-6c00-42cb-9877-0963bd56ae01',
  };
};

export const injectGatewayResultIntoResponse = (
  result: APIGatewayProxyStructuredResultV2 | string | any,
  resp: Response,
): void => {
  // result can have three different structures https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html

  // 1: string
  if (typeof result === 'string') {
    resp.status(200);
    resp.contentType('application/json');
    resp.json(JSON.parse(result));
    return;
  }

  // 2: structured output
  if (result.statusCode) {
    const structuredResult: APIGatewayProxyStructuredResultV2 =
      result as APIGatewayProxyStructuredResultV2;
    resp.status(structuredResult.statusCode || 200);

    if (structuredResult.headers) {
      resp.set(structuredResult.headers);
    }

    const contentType =
      structuredResult.headers?.['content-type'] || structuredResult.headers?.['Content-Type'];
    if (!contentType) {
      resp.contentType('application/json');
    } else {
      // content type would be set by headers above
    }
    if (structuredResult.cookies) {
      structuredResult.cookies.forEach((val) => {
        const obj = cookie.parse(val);
        Object.entries(obj).forEach((element) => {
          resp.cookie(element[0], element[1]);
        });
      });
    }
    if (structuredResult.body) {
      if (!structuredResult.isBase64Encoded) {
        resp.send(structuredResult.body);
      } else {
        resp.send(Buffer.from(structuredResult.body, 'base64'));
      }
    } else {
      resp.end();
    }
    return;
  }

  // 3: json object
  resp.status(200);
  resp.contentType('application/json');
  resp.json(result);
  return;
};
