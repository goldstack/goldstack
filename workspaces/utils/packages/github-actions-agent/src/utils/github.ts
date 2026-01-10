import { Octokit } from '@octokit/rest';

/**
 * Create an Octokit client using the provided token.
 */
export function createOctokit(token: string): Octokit {
  return new Octokit({
    auth: token,
  });
}

/**
 * Check if a PR exists for the given number.
 */
export async function isPr(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<boolean> {
  try {
    await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get PR data.
 */
export async function getPrData(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<{ title: string; body: string; headRefName: string }> {
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  return {
    title: data.title,
    body: data.body || '',
    headRefName: data.head.ref,
  };
}

/**
 * Get issue data.
 */
export async function getIssueData(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<{ title: string; body: string }> {
  const { data } = await octokit.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });
  return {
    title: data.title,
    body: data.body || '',
  };
}

/**
 * Get issue comments.
 */
export async function getIssueComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<string> {
  const { data } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });
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
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<string> {
  const { data } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });
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
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  sinceSha?: string
): Promise<string> {
  const { data } = await octokit.pulls.listReviewComments({
    owner,
    repo,
    pull_number: prNumber,
  });

  let comments = data;

  if (sinceSha) {
    const sinceIndex = data.findIndex(
      (comment) => comment.commit_id === sinceSha
    );
    if (sinceIndex !== -1) {
      comments = data.slice(sinceIndex);
    }
  }

  return comments
    .slice(0, 50)
    .map((comment) => {
      return `User: ${comment.user?.login || 'unknown'}\nFile: ${comment.path}\n${comment.body}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Check for existing PR with the given branch head.
 */
export async function findPrByBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string
): Promise<string> {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    head: `${owner}:${branchName}`,
    state: 'open',
  });
  return data.length > 0 ? String(data[0].number) : '';
}

/**
 * Create a comment on an issue or PR.
 */
export async function createComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
  _isPr?: boolean
): Promise<void> {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
}

/**
 * Create a draft PR.
 */
export async function createDraftPr(
  octokit: Octokit,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string
): Promise<string> {
  const { data } = await octokit.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base: 'master',
    draft: true,
  });
  return String(data.number);
}

/**
 * Get PR body.
 */
export async function getPrBody(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<string> {
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  return data.body || '';
}

/**
 * Update PR body.
 */
export async function updatePrBody(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<void> {
  await octokit.pulls.update({
    owner,
    repo,
    pull_number: prNumber,
    body,
  });
}
