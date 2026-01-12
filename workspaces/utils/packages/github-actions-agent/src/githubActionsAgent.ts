import { info } from '@goldstack/utils-log';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import type {
  BuildContextOptions,
  BuildContextResult,
  CheckoutBranchOptions,
  CreatePrOptions,
  CreatePrResult,
  FixPrBodyOptions,
  IdentifyBranchOptions,
  IdentifyBranchResult,
  IdentifyCommentOptions,
  IdentifyCommentResult,
  PostStartCommentOptions,
  RunAllOptions,
  RunKilocodeOptions,
} from './types';
import {
  branchExistsRemote,
  getCommitCount,
  getCurrentSha,
  gitAddAll,
  gitCheckout,
  gitClean,
  gitCommit,
  gitCreateBranch,
  gitFetch,
  gitPull,
  gitPush,
} from './utils/git';
import {
  createDraftPr,
  createGhToken,
  findPrByBranch,
  getIssueComments,
  getIssueData,
  getPrBody,
  getPrComments,
  getPrData,
  getPrReviewComments,
  createComment as ghCreateComment,
  isPr,
  updatePrBody,
} from './utils/github';

/**
 * GitHub Actions Agent for automating issue/PR workflows.
 */
export class GitHubActionsAgent {
  private token: string;
  private kiloApiKey: string;
  private owner: string;
  private repo: string;
  private remoteUrl: string;

  constructor(options: { token: string; kiloApiKey: string }) {
    this.token = options.token;
    this.kiloApiKey = options.kiloApiKey;
    // Extract owner/repo from git remote or environment
    this.remoteUrl = this.getGitRemoteUrl();
    const match = this.remoteUrl.match(/github\.com[/:]([^/]+)\/([^.]+)\.git/);
    if (match) {
      this.owner = match[1];
      this.repo = match[2];
    } else {
      // Default to environment or throw
      const repoSlug = process.env.GITHUB_REPOSITORY?.split('/') || [];
      this.owner = repoSlug[0] || 'goldstack';
      this.repo = repoSlug[1] || 'goldstack';
    }
  }

  private getGitRemoteUrl(): string {
    try {
      return execSync('git remote get-url origin', {
        encoding: 'utf-8',
      }).trim();
    } catch {
      return '';
    }
  }

  /**
   * Identify issue and PR numbers from a comment event.
   */
  async identifyComment(options: IdentifyCommentOptions): Promise<IdentifyCommentResult> {
    const gh = createGhToken(this.token);
    const issueNumber = options.issueNumber;
    let prNumber = '';
    let isPrComment = false;

    // Check if it's a PR comment
    if (await isPr(gh, this.owner, this.repo, issueNumber)) {
      isPrComment = true;
      prNumber = String(issueNumber);
    } else {
      // It's an issue comment - check the issue body for linked PR
      try {
        const issueData = await getIssueData(gh, this.owner, this.repo, issueNumber);

        // Look for "closes #", "fixes #", "resolves #" patterns in issue body
        const closesMatch = issueData.body.match(/closes\s+#(\d+)/i);
        const fixesMatch = issueData.body.match(/fixes\s+#(\d+)/i);
        const resolvesMatch = issueData.body.match(/resolves\s+#(\d+)/i);

        if (closesMatch) {
          prNumber = closesMatch[1];
        } else if (fixesMatch) {
          prNumber = fixesMatch[1];
        } else if (resolvesMatch) {
          prNumber = resolvesMatch[1];
        } else {
          // Check for existing PR with expected branch
          const branchName = `kilo-issue-${issueNumber}`;
          const existingPr = await findPrByBranch(gh, this.owner, this.repo, branchName);
          if (existingPr) {
            prNumber = existingPr;
          }
        }
      } catch {
        // Issue might not exist or be accessible, continue with empty prNumber
      }
    }

    return {
      issueNumber,
      prNumber,
      isPrComment,
    };
  }

  /**
   * Identify the working branch based on issue/PR context.
   */
  async identifyBranch(options: IdentifyBranchOptions): Promise<IdentifyBranchResult> {
    const gh = createGhToken(this.token);
    const { issueNumber, prNumber } = options;

    if (prNumber) {
      // Use PR's head branch name
      const prData = await getPrData(gh, this.owner, this.repo, prNumber);
      return {
        branchName: prData.headRefName,
      };
    }

    // Default to kilo-issue-<issueNumber>
    const branchName = `kilo-issue-${issueNumber}`;
    // Validate branch name follows best practices
    if (!/^kilo-issue-\d+$/.test(branchName)) {
      throw new Error(`Branch name '${branchName}' does not follow naming conventions`);
    }
    return {
      branchName,
    };
  }

  /**
   * Checkout the appropriate working branch.
   */
  async checkoutBranch(options: CheckoutBranchOptions): Promise<void> {
    const { branchName, prNumber } = options;

    gitFetch();

    if (prNumber) {
      gitClean();
      gitCheckout(branchName);
      gitPull(branchName);
    } else if (branchExistsRemote(branchName)) {
      gitClean();
      gitCheckout(branchName);
      gitPull(branchName);
    } else {
      // already on master, commit untracked files before creating branch
      try {
        gitAddAll();
        gitCommit('Auto-commit untracked files before creating branch');
      } catch {
        // ignore if no changes to commit
      }
      gitCreateBranch(branchName);
    }
  }

  /**
   * Build comprehensive task context from issue/PR and comments.
   */
  async buildContext(options: BuildContextOptions): Promise<BuildContextResult> {
    const gh = createGhToken(this.token);
    const { comment, issueNumber, prNumber, agentInstructionsPath = 'AGENTS_GHA.md' } = options;

    // Strip /kilo or /kilocode prefix
    const prompt = comment.replace(/^\/(kilo(code)?)\s*/i, '');

    const prefix = prNumber ? `PR #${prNumber}` : `Issue #${issueNumber}`;

    let title = '';
    let body = '';
    let headRefName = `kilo-issue-${issueNumber}`; // default branch name

    if (prNumber) {
      const prData = await getPrData(gh, this.owner, this.repo, prNumber);
      title = prData.title;
      body = prData.body;
      headRefName = prData.headRefName;
    } else {
      const issueData = await getIssueData(gh, this.owner, this.repo, issueNumber);
      title = issueData.title;
      body = issueData.body;
    }

    const currentSha = getCurrentSha();

    // Collect comments
    let issueComments = '';
    if (issueNumber && !prNumber) {
      issueComments = await getIssueComments(gh, this.owner, this.repo, issueNumber);
    }

    let prComments = '';
    if (prNumber) {
      prComments = await getPrComments(gh, this.owner, this.repo, prNumber);
    }

    let reviewComments = '';
    if (prNumber) {
      reviewComments = await getPrReviewComments(gh, this.owner, this.repo, prNumber, currentSha);
    }

    // Read project instructions
    let agents = '';
    if (fs.existsSync(agentInstructionsPath)) {
      agents = fs.readFileSync(agentInstructionsPath, 'utf-8');
    } else {
      throw new Error(`Agent instructions file not found at ${agentInstructionsPath}`);
    }

    // Build task string
    let task = `${prefix}: ${title}\n\n${body}\n\n`;
    if (issueComments) {
      task += `ISSUE COMMENTS:\n${issueComments}\n\n`;
    }
    if (prComments) {
      task += `PR COMMENTS:\n${prComments}\n\n`;
    }
    if (reviewComments) {
      task += `CODE REVIEW COMMENTS (on current commit):\n${reviewComments}\n\n`;
    }
    if (agents) {
      task += `PROJECT INSTRUCTIONS:\n${agents}\n\n`;
    }
    task += `TASK: ${prompt}\n\n`;
    task += `ISSUE_NUMBER: ${issueNumber}\n`;
    task += `BRANCH_NAME: ${headRefName}\n`;
    if (prNumber) {
      task += `PR_NUMBER: ${prNumber}\n`;
    }

    return {
      branchName: headRefName,
      prNumber: prNumber ? String(prNumber) : '',
      task,
    };
  }

  /**
   * Post a "started working" comment to issue or PR.
   */
  async postStartComment(options: PostStartCommentOptions): Promise<void> {
    const gh = createGhToken(this.token);
    const { issueNumber, prNumber, branchName, runUrl } = options;

    const comment = `🚀 Kilo Code has started working on this task.

- **Branch**: \`${branchName}\`
- **Issue**: #${issueNumber}
${prNumber ? `- **PR**: #${prNumber}\n` : ''}
- **Run**: [View workflow](${runUrl})`;

    await ghCreateComment(gh, this.owner, this.repo, issueNumber, comment, Boolean(prNumber));
  }

  /**
   * Post a progress update comment to issue or PR.
   */
  async postProgressComment(options: {
    issueNumber: number;
    prNumber?: number;
    message: string;
  }): Promise<void> {
    const gh = createGhToken(this.token);
    const { issueNumber, prNumber, message } = options;

    const comment = `🔄 Kilo Code progress update: ${message}`;

    await ghCreateComment(gh, this.owner, this.repo, issueNumber, comment, Boolean(prNumber));
  }

  /**
   * Fix literal \\n strings in PR body to actual newlines.
   */
  async fixPrBody(options: FixPrBodyOptions): Promise<void> {
    const gh = createGhToken(this.token);
    const { prNumber } = options;

    const prBody = await getPrBody(gh, this.owner, this.repo, prNumber);

    // Check if body contains literal \n
    if (prBody.includes('\\n')) {
      const fixedBody = prBody.replace(/\\n/g, '\n');
      await updatePrBody(gh, this.owner, this.repo, prNumber, fixedBody);
    }
  }

  /**
   * Create a draft PR from the current branch.
   */
  async createPr(options: CreatePrOptions): Promise<CreatePrResult> {
    const gh = createGhToken(this.token);
    const { issueNumber, branchName } = options;

    // Push the branch first
    gitPush(branchName);

    // Check if there are commits on the branch
    const commitCount = getCommitCount(branchName, 'master');
    if (commitCount === 0) {
      return {
        prNumber: '',
      };
    }

    // Get issue title for PR title
    const issueData = await getIssueData(gh, this.owner, this.repo, issueNumber);

    const newPrNumber = await createDraftPr(
      gh,
      this.owner,
      this.repo,
      `Fix: ${issueData.title}`,
      `Closes #${issueNumber}`,
      branchName,
    );

    return {
      prNumber: newPrNumber,
    };
  }

  /**
   * Run Kilo Code agent.
   */
  async runKilocode(options: RunKilocodeOptions): Promise<void> {
    const {
      task,
      auto = true,
      timeout = 2700,
      model,
      kiloProvider = 'kilocode',
      kiloProviderType = 'kilocode',
    } = options;

    // Set environment variables
    const kiloEnv: Record<string, string | undefined> = {
      ...process.env,
      KILO_PROVIDER: kiloProvider,
      KILO_PROVIDER_TYPE: kiloProviderType,
      KILOCODE_API_KEY: this.kiloApiKey,
      KILOCODE_TOKEN: this.kiloApiKey,
      GITHUB_TOKEN: this.token,
      KILO_TELEMETRY_DEBUG: 'false',
    };
    if (model) {
      kiloEnv.KILOCODE_MODEL = model;
    }

    // Write task to temporary file
    const tempFile = path.join(os.tmpdir(), `kilo-task-${Date.now()}.txt`);
    fs.writeFileSync(tempFile, task);

    // Build the command to pipe the file into kilocode
    let command = `cat "${tempFile}" | kilocode --auto`;
    if (timeout) {
      command += ` --timeout ${timeout}`;
    }
    if (model) {
      command += ` --model ${model}`;
    }

    return new Promise<void>((resolve, reject) => {
      const child = spawn('sh', ['-c', command], {
        stdio: 'inherit',
        env: kiloEnv,
      });

      const timeoutMs = (timeout + 60) * 1000; // Add 60 second buffer
      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`KiloCode execution timed out after ${timeout + 60} seconds`));
      }, timeoutMs);

      child.on('exit', (code, signal) => {
        clearTimeout(timer);
        if (code !== 0) {
          reject(new Error(`KiloCode exited with code ${code}`));
        } else {
          resolve();
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    }).finally(() => {
      // Clean up temp file
      fs.unlinkSync(tempFile);
    });
  }

  /**
   * Run the complete workflow.
   */
  async runAll(options: RunAllOptions): Promise<void> {
    const {
      comment,
      issueNumber,
      auto = true,
      timeout = 2700,
      workDir,
      kiloModel,
      kiloProvider,
      kiloProviderType,
      agentInstructionsPath,
    } = options;

    if (workDir) {
      if (!fs.existsSync(workDir)) {
        fs.mkdirSync(workDir, { recursive: true });
      }
      process.chdir(workDir);
      info(`Changed working directory to: ${workDir}`);

      // Check if it's a git repository
      if (!fs.existsSync('.git')) {
        info('Directory is not a git repository, cloning...');
        const { execSync, spawn } = require('child_process');
        execSync(`git clone ${this.remoteUrl} .`, {
          encoding: 'utf-8',
          stdio: 'inherit',
        });
        info('Repository cloned successfully');
      }
    }

    info('Starting Kilo Code workflow execution');

    // Step 1: Identify comment
    info('Identifying comment and PR numbers...');
    const { prNumber } = await this.identifyComment({
      comment,
      issueNumber,
    });
    info(`Identified issue #${issueNumber}${prNumber ? ` and PR #${prNumber}` : ''}`);

    // Step 2: Identify branch
    info('Identifying working branch...');
    const { branchName } = await this.identifyBranch({
      issueNumber,
      prNumber: prNumber ? parseInt(prNumber, 10) : undefined,
    });
    info(`Working branch identified: ${branchName}`);

    // Step 3: Checkout branch
    info('Checking out working branch...');
    await this.checkoutBranch({
      branchName,
      prNumber: prNumber ? parseInt(prNumber, 10) : undefined,
    });
    info('Branch checked out successfully');

    // Step 4: Build context
    info('Building task context from issue/PR and comments...');
    const { task, prNumber: ctxPrNumber } = await this.buildContext({
      comment,
      issueNumber,
      prNumber: prNumber ? parseInt(prNumber, 10) : undefined,
      agentInstructionsPath,
    });
    info('Task context built successfully');

    // Step 5: Post start comment
    info('Posting start comment to issue/PR...');
    const runUrl = `https://github.com/${this.owner}/${this.repo}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    await this.postStartComment({
      issueNumber,
      prNumber: ctxPrNumber ? parseInt(ctxPrNumber, 10) : undefined,
      branchName,
      runUrl,
    });
    info('Start comment posted successfully');

    // Step 6: Run Kilo Code
    info('Running Kilo Code agent...');
    await this.runKilocode({
      task,
      auto,
      timeout,
      model: kiloModel || process.env.KILOCODE_MODEL,
      kiloProvider,
      kiloProviderType,
    });
    info('Kilo Code execution completed');

    // Post progress update
    await this.postProgressComment({
      issueNumber,
      prNumber: ctxPrNumber ? parseInt(ctxPrNumber, 10) : undefined,
      message: 'Kilo Code task execution completed successfully.',
    });

    // Step 7: Fix PR body if needed
    // if (ctxPrNumber) {
    //   info('Fixing PR body formatting...');
    //   await this.fixPrBody({
    //     prNumber: parseInt(ctxPrNumber, 10),
    //   });
    //   info('PR body fixed successfully');
    // }

    // Step 8: Create PR if needed
    if (!ctxPrNumber) {
      info('Creating pull request...');
      const { prNumber: newPrNumber } = await this.createPr({
        issueNumber,
        branchName,
      });
      if (newPrNumber) {
        info(`Pull request created: #${newPrNumber}`);
      } else {
        info('No pull request created (no commits on branch)');
      }
    }

    info('Kilo Code workflow execution completed successfully');
  }
}
