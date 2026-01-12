import { execSync } from 'child_process';

/**
 * Execute a git command and return the output.
 */
function gitExec(args: string[]): string {
  return execSync(`git ${args.join(' ')}`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

/**
 * Configure git user.
 */
export function configureGit(userName: string, userEmail: string): void {
  gitExec(['config', 'user.name', userName]);
  gitExec(['config', 'user.email', userEmail]);
}

/**
 * Fetch all remote branches.
 */
export function gitFetch(): void {
  gitExec(['fetch', 'origin']);
}

/**
 * Checkout a branch.
 */
export function gitCheckout(branchName: string): void {
  gitExec(['checkout', branchName]);
}

/**
 * Pull from a branch.
 */
export function gitPull(branchName: string): void {
  gitExec(['pull', 'origin', branchName]);
}

/**
 * Create a new branch and checkout.
 */
export function gitCreateBranch(branchName: string): void {
  gitExec(['checkout', '-b', branchName]);
}

/**
 * Push a branch to origin.
 */
export function gitPush(branchName: string): void {
  gitExec(['push', 'origin', branchName]);
}

/**
 * Get the current HEAD SHA.
 */
export function getCurrentSha(): string {
  return gitExec(['rev-parse', 'HEAD']).trim();
}

/**
 * Check if a branch exists remotely.
 */
export function branchExistsRemote(branchName: string): boolean {
  try {
    gitExec(['ls-remote', '--exit-code', '--heads', 'origin', branchName]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean untracked files and directories.
 */
export function gitClean(): void {
  gitExec(['clean', '-fd']);
}

/**
 * Add all files to staging.
 */
export function gitAddAll(): void {
  gitExec(['add', '.']);
}

/**
 * Commit with a message.
 */
export function gitCommit(message: string): void {
  gitExec(['commit', '-m', message]);
}

/**
 * Get the number of commits on the branch compared to master.
 */
export function getCommitCount(_branchName: string, baseBranch: string): number {
  try {
    const count = gitExec(['rev-list', '--count', `HEAD ^origin/${baseBranch}`]).trim();
    return parseInt(count, 10);
  } catch {
    return 0;
  }
}
