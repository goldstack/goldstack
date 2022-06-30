export enum RouteType {
  DIR = 'DIR',
  FUNCTION = 'FUNCTION',
}
export interface LambdaConfig {
  name: string;
  type: RouteType;
  absoluteFilePath: string;
  relativeFilePath: string;
  path: string;
  route: string;
}
