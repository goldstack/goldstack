import { execSync } from 'child_process';
import { logger } from '@goldstack/utils-cli';

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
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute a gh CLI command and return the result.
 */
export function runGhCommand(args: string, token?: string): GhCommandResult {
  const env = { ...process.env };
  if (token) {
    env.GITHUB_TOKEN = token;
  }

  try {
    const stdout = execSync(`gh ${args}`, {
      encoding: 'utf-8',
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      success: true,
      stdout,
      stderr: '',
      exitCode: 0,
    };
  } catch (error) {
    const err = error as { status?: number; stdout?: string; stderr?: string };
    return {
      success: false,
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status || 1,
    };
  }
}

/**
 * Execute a gh CLI command and return parsed JSON output.
 */
export function runGhCommandJson<T>(args: string, token?: string): T | null {
  const result = runGhCommand(`${args} --json`, token);
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
  const result = runGhCommand(
    `pr view ${prNumber} --repo ${owner}/${repo} --json number --jq '.number'`,
    token.token,
  );
  return result.success && result.stdout.trim() === String(prNumber);
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
    `pr view ${prNumber} --repo ${owner}/${repo}`,
    token.token,
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
    `issue view ${issueNumber} --repo ${owner}/${repo}`,
    token.token,
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
 * Get issue comments.
 */
export async function getIssueComments(
  token: GhToken,
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<string> {
  const data = runGhCommandJson<GhCommentData[]>(
    `issue comment list ${issueNumber} --repo ${owner}/${repo}`,
    token.token,
  );
  if (!data) {
    return '';
  }
  return data
    .map((comment) => {
      return `User: ${comment.user?.login || 'unknown'}\n${comment.body}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Get PR comments.
 */
export async function getPrComments(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<string> {
  const data = runGhCommandJson<GhCommentData[]>(
    `pr comment list ${prNumber} --repo ${owner}/${repo}`,
    token.token,
  );
  if (!data) {
    return '';
  }
  return data
    .map((comment) => {
      return `User: ${comment.user?.login || 'unknown'}\n${comment.body}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Get PR review comments on or after the given SHA.
 */
export async function getPrReviewComments(
  token: GhToken,
  owner: string,
  repo: string,
  prNumber: number,
  _sinceSha?: string,
): Promise<string> {
  // gh pr review comment list doesn't support filtering by SHA directly
  // We'll get all comments and filter if needed
  const data = runGhCommandJson<GhCommentData[]>(
    `pr review comment list ${prNumber} --repo ${owner}/${repo}`,
    token.token,
  );
  if (!data) {
    return '';
  }

  // Limit to 50 comments as in the original implementation
  return data
    .slice(0, 50)
    .map((comment) => {
      return `User: ${comment.user?.login || 'unknown'}\n${comment.body}`;
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
    `pr list --repo ${owner}/${repo} --head ${owner}:${branchName} --state open --json number`,
    token.token,
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
  const result = runGhCommand(
    `issue comment create ${issueNumber} --repo ${owner}/${repo} --body "${body.replace(/"/g, '\\"')}"`,
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
    `pr create --repo ${owner}/${repo} --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}" --head ${head} --draft`,
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
    `pr view ${prNumber} --repo ${owner}/${repo} --json body`,
    token.token,
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
  const result = runGhCommand(
    `pr edit ${prNumber} --repo ${owner}/${repo} --body "${body.replace(/"/g, '\\"')}"`,
    token.token,
  );
  if (!result.success) {
    throw new Error(`Failed to update PR body: ${result.stderr}`);
  }
}
