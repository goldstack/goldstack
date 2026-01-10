/**
 * Options for identifying issue and PR numbers from a comment.
 */
export interface IdentifyCommentOptions {
  comment: string;
  issueNumber: number;
}

/**
 * Result of identifying issue and PR numbers.
 */
export interface IdentifyCommentResult {
  issueNumber: number;
  prNumber: string;
  isPrComment: boolean;
}

/**
 * Options for identifying the working branch.
 */
export interface IdentifyBranchOptions {
  issueNumber: number;
  prNumber?: number;
}

/**
 * Result of identifying branch name.
 */
export interface IdentifyBranchResult {
  branchName: string;
}

/**
 * Options for checking out a branch.
 */
export interface CheckoutBranchOptions {
  branchName: string;
  prNumber?: number;
}

/**
 * Options for building task context.
 */
export interface BuildContextOptions {
  comment: string;
  issueNumber: number;
  prNumber?: number;
  agentsFile?: string;
}

/**
 * Result of building task context.
 */
export interface BuildContextResult {
  branchName: string;
  prNumber: string;
  task: string;
}

/**
 * Options for posting a start comment.
 */
export interface PostStartCommentOptions {
  issueNumber: number;
  prNumber?: number;
  branchName: string;
  runUrl: string;
}

/**
 * Options for fixing PR body newlines.
 */
export interface FixPrBodyOptions {
  prNumber: number;
}

/**
 * Options for creating a PR.
 */
export interface CreatePrOptions {
  issueNumber: number;
  branchName: string;
}

/**
 * Result of creating a PR.
 */
export interface CreatePrResult {
  prNumber: string;
}

/**
 * Options for running Kilo Code.
 */
export interface RunKilocodeOptions {
  task: string;
  auto?: boolean;
  timeout?: number;
  model?: string;
}

/**
 * Options for running the complete workflow.
 */
export interface RunAllOptions {
  comment: string;
  issueNumber: number;
  auto?: boolean;
  timeout?: number;
}

/**
 * Environment variables required for the agent.
 */
export interface AgentEnvironment {
  GITHUB_TOKEN: string;
  KILOCODE_API_KEY: string;
}
