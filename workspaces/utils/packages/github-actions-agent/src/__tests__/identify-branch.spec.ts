/**
 * @jest-environment jsdom
 */
import { GitHubActionsAgent } from '../githubActionsAgent';

// Test configuration for real GitHub API tests
const TEST_OWNER = 'goldstack';
const TEST_REPO = 'goldstack';
const TEST_ISSUE_NUMBER = 518;
const TEST_PR_NUMBER = 519;
const TEST_BRANCH_NAME = 'kilo-issue-518';

import { config } from 'dotenv';

const envFile = process.env.ENV_FILE || '.env';
config({ path: envFile });

describe('identifyBranch', () => {
  let agent: GitHubActionsAgent;

  beforeAll(() => {
    // Initialize agent with a real token if available
    const token = process.env.GITHUB_TOKEN || '';
    const kiloApiKey = process.env.KILOCODE_API_KEY || '';
    agent = new GitHubActionsAgent({ token, kiloApiKey });
  });

  describe('when PR number is provided', () => {
    it('should return the PR head branch name', async () => {
      const result = await agent.identifyBranch({
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      expect(result.branchName).toBe(TEST_BRANCH_NAME);
    });

    it('should extract branch name from PR data correctly', async () => {
      const result = await agent.identifyBranch({
        issueNumber: TEST_ISSUE_NUMBER,
        prNumber: TEST_PR_NUMBER,
      });

      // Verify branch name follows expected pattern
      expect(result.branchName).toMatch(/^kilo-issue-\d+$/);
    });
  });

  describe('when only issue number is provided', () => {
    it('should return default kilo-issue branch name', async () => {
      const result = await agent.identifyBranch({
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.branchName).toBe(`kilo-issue-${TEST_ISSUE_NUMBER}`);
    });

    it('should generate branch name based on issue number', async () => {
      const result = await agent.identifyBranch({
        issueNumber: TEST_ISSUE_NUMBER,
      });

      // Verify the branch name matches the expected pattern
      expect(result.branchName).toBe('kilo-issue-518');
    });
  });

  describe('branch name format validation', () => {
    it('should handle numeric issue numbers correctly', async () => {
      const result = await agent.identifyBranch({
        issueNumber: 123,
      });

      expect(result.branchName).toBe('kilo-issue-123');
    });

    it('should handle larger issue numbers', async () => {
      const result = await agent.identifyBranch({
        issueNumber: 9999,
      });

      expect(result.branchName).toBe('kilo-issue-9999');
    });
  });
});
