/**
 * Build Context Tests
 */

import * as fs from 'fs';
import { GitHubActionsAgent } from '../githubActionsAgent';

// Test configuration for real GitHub API tests
const TEST_OWNER = 'goldstack';
const TEST_REPO = 'goldstack';
const TEST_ISSUE_NUMBER = 518;
const TEST_PR_NUMBER = 519;

import { config } from 'dotenv';

const envFile = process.env.ENV_FILE || '.env';
config({ path: envFile });

describe('buildContext', () => {
  let agent: GitHubActionsAgent;

  beforeAll(() => {
    // Initialize agent with a real token if available
    const token = process.env.GITHUB_TOKEN || '';
    const kiloApiKey = process.env.KILOCODE_API_KEY || '';
    agent = new GitHubActionsAgent({ token, kiloApiKey });
  });

  describe('when only issue is available', () => {
    it('should build context with issue data', async () => {
      const result = await agent.buildContext({
        comment: '/kilo fix the bug',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.branchName).toBe('kilo-issue-518');
      expect(result.prNumber).toBe('');
      expect(result.task).toContain('Test Issue');
    });

    it('should include issue description in task', async () => {
      const result = await agent.buildContext({
        comment: '/kilo work on this',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.task).toContain('This is the description');
    });

    it('should include issue comments in task', async () => {
      const result = await agent.buildContext({
        comment: '/kilo check comments',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.task).toContain('ISSUE COMMENTS');
      expect(result.task).toContain('First comment on issue');
    });

    it('should strip /kilo prefix from comment', async () => {
      const result = await agent.buildContext({
        comment: '/kilo fix the bug',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.task).toContain('TASK: fix the bug');
    });

    it('should strip /kilocode prefix from comment', async () => {
      const result = await agent.buildContext({
        comment: '/kilocode review this',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.task).toContain('TASK: review this');
    });
  });

  describe('when PR is available', () => {
    it('should build context with PR data', async () => {
      const result = await agent.buildContext({
        comment: '/kilo review this',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.branchName).toBe('kilo-issue-518');
      expect(result.prNumber).toBe(String(TEST_PR_NUMBER));
    });

    it('should include PR title in task', async () => {
      const result = await agent.buildContext({
        comment: '/kilo review',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.task).toContain('PR #519');
      expect(result.task).toContain('This is what the PR is about');
    });

    it('should include PR comments in task', async () => {
      const result = await agent.buildContext({
        comment: '/kilo check',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.task).toContain('PR COMMENTS');
      expect(result.task).toContain('First PR comment');
    });

    it('should use PR head ref as branch name', async () => {
      const result = await agent.buildContext({
        comment: '/kilo checkout',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.branchName).toBe('kilo-issue-518');
      expect(result.task).toContain('BRANCH_NAME: kilo-issue-518');
    });
  });

  describe('task format validation', () => {
    it('should include prefix (PR or Issue) in task', async () => {
      const result = await agent.buildContext({
        comment: '/kilo test',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.task).toMatch(/^(PR|Issue) #\d+:/);
    });

    it('should include ISSUE_NUMBER in task', async () => {
      const result = await agent.buildContext({
        comment: '/kilo test',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.task).toContain('ISSUE_NUMBER: 518');
    });

    it('should include PR_NUMBER in task when PR exists', async () => {
      const result = await agent.buildContext({
        comment: '/kilo test',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.task).toContain('PR_NUMBER: 519');
    });
  });

  describe('custom agents file', () => {
    it('should read custom agents file if provided', async () => {
      // Check if a custom agents file exists
      const customAgentsFile = 'AGENTS_GHA.md';
      const fileExists = fs.existsSync(customAgentsFile);

      const result = await agent.buildContext({
        comment: '/kilo test',
        issueNumber: TEST_ISSUE_NUMBER,
        agentsFile: fileExists ? customAgentsFile : undefined,
      });

      expect(result.branchName).toBe('kilo-issue-518');
    });
  });
});
