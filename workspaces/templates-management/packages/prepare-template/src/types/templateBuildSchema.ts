/**
 * Glob for file or folder to copy.
 *
 * @title Glob
 */
export type Glob = string;
export type Files = Glob[];

export interface FieldOverwriteConfig {
  path: string;

  value: any;
}

export interface FileOverwriteConfiguration {
  file: string;
  fields: FieldOverwriteConfig[];
}

/**
 * Goldstack template build instructions.
 *
 * @title Template Build Configuration
 */
export interface TemplateBuildConfiguration {
  include: Files;
  exclude: Files;
  overwriteFiles?: FileOverwriteConfiguration[];
}
