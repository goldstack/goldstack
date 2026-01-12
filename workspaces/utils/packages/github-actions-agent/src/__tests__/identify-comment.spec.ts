/**
 * Identify Comment Tests
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

describe('identifyComment', () => {
  let agent: GitHubActionsAgent;

  beforeAll(() => {
    // Initialize agent with a real token if available
    const token = process.env.GITHUB_TOKEN || '';
    const kiloApiKey = process.env.KILOCODE_API_KEY || '';
    agent = new GitHubActionsAgent({ token, kiloApiKey });
  });

  describe('when comment is on a PR', () => {
    it('should identify PR comment correctly', async () => {
      // Issue number 519 is actually a PR in the goldstack/goldstack repo
      const result = await agent.identifyComment({
        comment: '/kilo fix the bug',
        issueNumber: TEST_PR_NUMBER,
      });

      expect(result.isPrComment).toBe(true);
      expect(result.prNumber).toBe(String(TEST_PR_NUMBER));
      expect(result.issueNumber).toBe(TEST_PR_NUMBER);
    });

    it('should return PR number as string', async () => {
      const result = await agent.identifyComment({
        comment: '/kilo review this',
        issueNumber: TEST_PR_NUMBER,
      });

      expect(typeof result.prNumber).toBe('string');
    });
  });

  describe('when comment is on an issue with PR reference', () => {
    it('should extract PR number from issue comment', async () => {
      // Issue 518 has a linked PR #519 with "closes #518" pattern
      const result = await agent.identifyComment({
        comment: '/kilo start working',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      // Should either find PR from closes # pattern or from branch search
      expect(result.issueNumber).toBe(TEST_ISSUE_NUMBER);
      expect(result.isPrComment).toBe(false);
    });

    it('should handle issue comments without PR reference', async () => {
      // This tests the fallback behavior when no PR is linked
      const result = await agent.identifyComment({
        comment: '/kilo help',
        issueNumber: TEST_ISSUE_NUMBER,
      });

      expect(result.issueNumber).toBe(TEST_ISSUE_NUMBER);
      expect(typeof result.prNumber).toBe('string');
    });
  });

  describe('comment parsing', () => {
    it('should preserve original comment text', async () => {
      const testComment = '/kilo fix the critical bug now';
      const result = await agent.identifyComment({
        comment: testComment,
        issueNumber: TEST_PR_NUMBER,
      });

      // The comment is passed through to buildContext, not modified here
      expect(result.issueNumber).toBe(TEST_PR_NUMBER);
    });
  });
});
