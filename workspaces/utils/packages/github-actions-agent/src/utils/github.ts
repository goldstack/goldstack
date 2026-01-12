import { logger } from '@goldstack/utils-cli';
import { spawnSync } from 'child_process';

/**
 * Result type for gh CLI command execution.
 */
export interface GhCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Check if gh CLI is available on the system.
 */
export function isGhAvailable(): boolean {
  try {
    const result = spawnSync('gh', ['--version'], { stdio: 'ignore' });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Execute a gh CLI command and return the result.
 */
export function runGhCommand(args: string[], token?: string): GhCommandResult {
  const env = { ...process.env };
  if (token) {
    env.GITHUB_TOKEN = token;
  }

  const result = spawnSync('gh', args, {
    encoding: 'utf-8',
    env,
    stdio: 'pipe',
  });

  if (result.error) {
    return {
      success: false,
      stdout: '',
      stderr: result.error.message,
      exitCode: 1,
    };
  }

  return {
    success: result.status === 0,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status ?? 0,
  };
}

/**
 * Execute a gh CLI command and return parsed JSON output.
 */
export function runGhCommandJson<T>(args: string[], token?: string, jsonFields?: string): T | null {
  const fullArgs = jsonFields ? [...args, '--json', jsonFields] : args;
  const result = runGhCommand(fullArgs, token);
  if (!result.success || !result.stdout) {
    return null;
  }
  try {
    return JSON.parse(result.stdout) as T;
  } catch {
    logger().error({}, 'Failed to parse JSON output from gh command');
    return null;
  }
}

/**
 * GitHub repository identifier.
 */
export interface GhRepo {
  owner: string;
  repo: string;
}

/**
 * GitHub PR data returned by gh CLI.
 */
export interface GhPrData {
  number: number;
  title: string;
  body: string;
  headRefName: string;
  state: string;
  isDraft: boolean;
  baseRefName: string;
}

/**
 * GitHub issue data returned by gh CLI.
 */
export interface GhIssueData {
  number: number;
  title: string;
  body: string;
  state: string;
}

/**
 * GitHub comment data returned by gh CLI.
 */
export interface GhCommentData {
  id: number;
  body: string;
  user: {
    login: string;
  };
  created_at: string;
}

/**
 * GitHub review comment data returned by gh CLI.
 */
export interface GhReviewCommentData {
  id: number;
  body: string;
  user: {
    login: string;
  };
  path: string;
  position: number | null;
  created_at: string;
}

/**
 * Create a token identifier (for compatibility with Octokit-based code).
 * In gh CLI mode, the token is used for authentication but not stored in an object.
 */
export interface GhToken {
  token: string;
}

/**
 * Check if gh CLI is available and warn if not.
 */
export function ensureGhAvailable(): void {
  if (!isGhAvailable()) {
    throw new Error(
      'GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/',
    );
  }
}

/**
 * Create a token identifier (for compatibility with Octokit-based code).
 * The token is used for gh CLI authentication.
 */
export function createGhToken(token: string): GhToken {
  ensureGhAvailable();
  return { token };
}

/**
 * Check if a PR exists for the given number.
 */
export async function isPr(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<boolean> {
  // Request at least one PR-specific field (headRefName) to ensure proper validation
  const data = runGhCommandJson<{ number: number; headRefName: string }>(
    ['pr', 'view', prNumber.toString(), '--repo', `${owner}/${repo}`],
    token.token,
    'number,headRefName',
  );
  // PR exists only if we got data AND the number matches and headRefName is defined
  return data !== null && data.number === prNumber && data.headRefName !== undefined;
}

/**
 * Get PR data.
 */
export async function getPrData(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<{ title: string; body: string; headRefName: string }> {
  const data = runGhCommandJson<GhPrData>(
    ['pr', 'view', prNumber.toString(), '--repo', `${owner}/${repo}`],
    token.token,
    'title,body,headRefName',
  );
  if (!data) {
    throw new Error(`Failed to get PR data for #${prNumber}`);
  }
  return {
    title: data.title,
    body: data.body || '',
    headRefName: data.headRefName,
  };
}

/**
 * Get issue data.
 */
export async function getIssueData(
  token: GhToken,
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<{ title: string; body: string }> {
  const data = runGhCommandJson<GhIssueData>(
    ['issue', 'view', issueNumber.toString(), '--repo', `${owner}/${repo}`],
    token.token,
    'title,body',
  );
  if (!data) {
    throw new Error(`Failed to get issue data for #${issueNumber}`);
  }
  return {
    title: data.title,
    body: data.body || '',
  };
}

/**
 * Get issue comments using GitHub API.
 */
export async function getIssueComments(
  token: GhToken,
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<string> {
  const data = runGhCommandJson<GhCommentData[]>(
    ['api', `repos/${owner}/${repo}/issues/${issueNumber}/comments?sort=created&direction=desc`],
    token.token,
  );
  if (!data) {
    return '';
  }
  return data
    .map((comment) => {
      return `User: ${comment.user?.login || 'unknown'} at ${comment.created_at}\n${comment.body}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Get PR comments using GitHub API.
 */
export async function getPrComments(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<string> {
  const data = runGhCommandJson<GhCommentData[]>(
    ['api', `repos/${owner}/${repo}/issues/${prNumber}/comments?sort=created&direction=desc`],
    token.token,
  );
  if (!data) {
    return '';
  }
  return data
    .map((comment) => {
      return `User: ${comment.user?.login || 'unknown'} at ${comment.created_at}\n${comment.body}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Get PR review comments on or after the given SHA using GitHub API.
 */
export async function getPrReviewComments(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
  _sinceSha?: string,
): Promise<string> {
  // Use GitHub API to get PR review comments
  const data = runGhCommandJson<GhReviewCommentData[]>(
    ['api', `repos/${owner}/${repo}/pulls/${prNumber}/comments?sort=created&direction=desc`],
    token.token,
  );
  if (!data) {
    return '';
  }

  // Limit to 50 comments as in the original implementation
  return data
    .slice(0, 50)
    .map((comment) => {
      const lineInfo = comment.position ? `\nLine: ${comment.position}` : '';
      return `File: ${comment.path}${lineInfo}\nUser: ${comment.user?.login || 'unknown'} at ${comment.created_at}\n${comment.body}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Check for existing PR with the given branch head.
 */
export async function findPrByBranch(
  token: GhToken,
  owner: string,
  repo: string,
  branchName: string,
): Promise<string> {
  const data = runGhCommandJson<{ number: number }[]>(
    ['pr', 'list', '--repo', `${owner}/${repo}`, '--head', branchName, '--state', 'open'],
    token.token,
    'number',
  );
  if (!data || data.length === 0) {
    return '';
  }
  return String(data[0].number);
}

/**
 * Create a comment on an issue or PR.
 */
export async function createComment(
  token: GhToken,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
  _isPr?: boolean,
): Promise<void> {
  // Escape the body to handle special characters like newlines and backticks
  const escapedBody = JSON.stringify(body).slice(1, -1);
  const result = runGhCommand(
    [
      'issue',
      'comment',
      issueNumber.toString(),
      '--repo',
      `${owner}/${repo}`,
      '--body',
      escapedBody,
    ],
    token.token,
  );
  if (!result.success) {
    throw new Error(`Failed to create comment: ${result.stderr}`);
  }
}

/**
 * Create a draft PR.
 */
export async function createDraftPr(
  token: GhToken,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
): Promise<string> {
  const result = runGhCommand(
    [
      'pr',
      'create',
      '--repo',
      `${owner}/${repo}`,
      '--title',
      title,
      '--body',
      body,
      '--head',
      head,
      '--draft',
    ],
    token.token,
  );
  if (!result.success) {
    throw new Error(`Failed to create draft PR: ${result.stderr}`);
  }
  // Extract PR number from output
  const match = result.stdout.match(/https:\/\/github\.com\/.*\/pull\/(\d+)/);
  return match ? match[1] : '';
}

/**
 * Get PR body.
 */
export async function getPrBody(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<string> {
  const data = runGhCommandJson<{ body: string }>(
    ['pr', 'view', prNumber.toString(), '--repo', `${owner}/${repo}`],
    token.token,
    'body',
  );
  return data?.body || '';
}

/**
 * Update PR body.
 */
export async function updatePrBody(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
): Promise<void> {
  const escapedBody = JSON.stringify(body).slice(1, -1);
  const result = runGhCommand(
    ['pr', 'edit', prNumber.toString(), '--repo', `${owner}/${repo}`, '--body', escapedBody],
    token.token,
  );
  if (!result.success) {
    throw new Error(`Failed to update PR body: ${result.stderr}`);
  }
}
