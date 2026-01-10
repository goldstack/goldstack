/**
 * @jest-environment jsdom
 */
import { GitHubActionsAgent } from '../githubActionsAgent';

// Test configuration for real GitHub API tests
const TEST_OWNER = 'goldstack';
const TEST_REPO = 'goldstack';
const TEST_ISSUE_NUMBER = 518;
const TEST_PR_NUMBER = 519;

import { config } from 'dotenv';

const envFile = process.env.ENV_FILE || '.env';
config({ path: envFile });

describe('GitHubActionsAgent', () => {
  let agent: GitHubActionsAgent;

  beforeAll(() => {
    // Initialize agent with a real token if available
    const token = process.env.GITHUB_TOKEN || '';
    const kiloApiKey = process.env.KILOCODE_API_KEY || '';
    agent = new GitHubActionsAgent({ token, kiloApiKey });
  });

  describe('constructor', () => {
    it('should initialize with token and kiloApiKey', () => {
      const testAgent = new GitHubActionsAgent({
        token: 'test-token',
        kiloApiKey: 'test-api-key',
      });
      expect(testAgent).toBeDefined();
    });
  });

  describe('identifyComment', () => {
    it('should identify comment on PR', async () => {
      const result = await agent.identifyComment({
        comment: '/kilo fix the bug',
        issueNumber: TEST_PR_NUMBER,
      });

      expect(result.issueNumber).toBe(TEST_PR_NUMBER);
      expect(result.isPrComment).toBe(true);
      expect(result.prNumber).toBe(String(TEST_PR_NUMBER));
    });

    it('should identify comment on issue', async () => {
      const result = await agent.identifyComment({
        comment: '/kilo start working',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.issueNumber).toBe(TEST_ISSUE_NUMBER);
      expect(result.isPrComment).toBe(false);
    });
  });

  describe('identifyBranch', () => {
    it('should return PR branch when PR number is provided', async () => {
      const result = await agent.identifyBranch({
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.branchName).toBe('kilo-issue-518');
    });

    it('should return default branch when only issue is provided', async () => {
      const result = await agent.identifyBranch({
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.branchName).toBe('kilo-issue-518');
    });
  });

  describe('buildContext', () => {
    it('should build context from issue only', async () => {
      const result = await agent.buildContext({
        comment: '/kilo fix the bug',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.branchName).toBe('kilo-issue-518');
      expect(result.prNumber).toBe('');
      expect(result.task).toContain('ISSUE_NUMBER: 518');
      expect(result.task).toContain('BRANCH_NAME: kilo-issue-518');
    });

    it('should build context from PR', async () => {
      const result = await agent.buildContext({
        comment: '/kilo review this',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.branchName).toBe('kilo-issue-518');
      expect(result.prNumber).toBe(String(TEST_PR_NUMBER));
      expect(result.task).toContain('PR_NUMBER: 519');
    });

    it('should strip /kilo prefix from comment', async () => {
      const result = await agent.buildContext({
        comment: '/kilo do something',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.task).toContain('TASK: do something');
    });
  });

  describe('full workflow integration', () => {
    it('should complete identifyComment -> identifyBranch -> buildContext flow', async () => {
      // Step 1: Identify comment
      const { prNumber } = await agent.identifyComment({
        comment: '/kilo test workflow',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      // Step 2: Identify branch
      const { branchName } = await agent.identifyBranch({
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: prNumber ? parseInt(prNumber, 10) : undefined,
      });

      // Step 3: Build context
      const { task } = await agent.buildContext({
        comment: '/kilo test workflow',
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: prNumber ? parseInt(prNumber, 10) : undefined,
      });

      // Verify the flow worked correctly
      expect(typeof branchName).toBe('string');
      expect(branchName.length).toBeGreaterThan(0);
      expect(typeof task).toBe('string');
      expect(task.length).toBeGreaterThan(0);
    });

    it('should handle both issue-only and PR scenarios', async () => {
      // Test with PR
      const withPr = await agent.identifyComment({
        comment: '/kilo test',
        issueNumber: TEST_PR_NUMBER,
      });
      expect(withPr.isPrComment).toBe(true);

      // Test with issue only
      const withoutPr = await agent.identifyComment({
        comment: '/kilo test',
        issueNumber: TEST_ISSUE_NUMBER,
      });
      expect(withoutPr.isPrComment).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle missing GitHub token gracefully', async () => {
      const agentWithoutToken = new GitHubActionsAgent({
        token: '',
        kiloApiKey: '',
      });

      // The agent will still be created, but API calls will fail
      await expect(
        agentWithoutToken.identifyComment({
          comment: '/kilo test',
          issueNumber: TEST_ISSUE_NUMBER,
        }),
      ).rejects.toThrow();
    });
  });
});
