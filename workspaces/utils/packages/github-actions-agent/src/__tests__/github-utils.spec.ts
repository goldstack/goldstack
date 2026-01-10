/**
 * @jest-environment jsdom
 */

import { config } from 'dotenv';
import {
  createGhToken,
  findPrByBranch,
  getIssueComments,
  getIssueData,
  getPrComments,
  getPrData,
  isPr,
} from '../utils/github';

const envFile = process.env.ENV_FILE || '.env';
config({ path: envFile });

// Test configuration for real GitHub API tests
const TEST_OWNER = 'goldstack';
const TEST_REPO = 'goldstack';
const TEST_ISSUE_NUMBER = 518;
const TEST_PR_NUMBER = 519;
const TEST_BRANCH_NAME = 'kilo-issue-518';

describe('GitHub Utilities', () => {
  let gh: ReturnType<typeof createGhToken>;

  beforeAll(() => {
    const token = process.env.GITHUB_TOKEN || '';
    gh = createGhToken(token);
  });

  describe('createGhToken', () => {
    it('should create GhToken instance with auth token', () => {
      const ghInstance = createGhToken('test-token');
      expect(ghInstance).toBeDefined();
      expect(typeof ghInstance).toBe('object');
      expect(ghInstance.token).toBe('test-token');
    });
  });

  describe('isPr', () => {
    it('should return true for PR number', async () => {
      const result = await isPr(gh, TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(result).toBe(true);
    });

    it('should return false for issue number', async () => {
      const result = await isPr(gh, TEST_OWNER, TEST_REPO, TEST_ISSUE_NUMBER);
      expect(result).toBe(false);
    });

    it('should handle non-existent number gracefully', async () => {
      const result = await isPr(gh, TEST_OWNER, TEST_REPO, 99999999);
      expect(result).toBe(false);
    });
  });

  describe('getPrData', () => {
    it('should return PR data with title, body, and headRefName', async () => {
      const prData = await getPrData(gh, TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      expect(prData).toHaveProperty('title');
      expect(prData).toHaveProperty('body');
      expect(prData).toHaveProperty('headRefName');
      expect(prData.headRefName).toBe(TEST_BRANCH_NAME);
    });

    it('should return non-empty title', async () => {
      const prData = await getPrData(gh, TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(prData.title.length).toBeGreaterThan(0);
    });

    it('should handle PR with empty body', async () => {
      // Test with a PR that might have empty body
      const prData = await getPrData(gh, TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(prData.body).toBeDefined();
      expect(typeof prData.body).toBe('string');
    });
  });

  describe('getIssueData', () => {
    it('should return issue data with title and body', async () => {
      const issueData = await getIssueData(gh, TEST_OWNER, TEST_REPO, TEST_ISSUE_NUMBER);

      expect(issueData).toHaveProperty('title');
      expect(issueData).toHaveProperty('body');
      expect(issueData.title).toContain('Test Issue');
    });

    it('should return non-empty title', async () => {
      const issueData = await getIssueData(gh, TEST_OWNER, TEST_REPO, TEST_ISSUE_NUMBER);
      expect(issueData.title.length).toBeGreaterThan(0);
    });

    it('should handle issue with description', async () => {
      const issueData = await getIssueData(gh, TEST_OWNER, TEST_REPO, TEST_ISSUE_NUMBER);
      expect(issueData.body).toContain('This is the description');
    });
  });

  describe('getIssueComments', () => {
    it('should return comments for issue', async () => {
      const comments = await getIssueComments(gh, TEST_OWNER, TEST_REPO, TEST_ISSUE_NUMBER);
      expect(typeof comments).toBe('string');
    });

    it('should include comment body', async () => {
      const comments = await getIssueComments(gh, TEST_OWNER, TEST_REPO, TEST_ISSUE_NUMBER);
      expect(comments).toContain('First comment on issue');
    });

    it('should format comments with user info', async () => {
      const comments = await getIssueComments(gh, TEST_OWNER, TEST_REPO, TEST_ISSUE_NUMBER);
      expect(comments).toContain('User:');
    });

    it('should return empty string for issue with no comments', async () => {
      const comments = await getIssueComments(gh, TEST_OWNER, TEST_REPO, 99999999);
      expect(comments).toBe('');
    });
  });

  describe('getPrComments', () => {
    it('should return comments for PR', async () => {
      const comments = await getPrComments(gh, TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(typeof comments).toBe('string');
    });

    it('should include PR comment body', async () => {
      const comments = await getPrComments(gh, TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(comments).toContain('First PR comment');
    });

    it('should format comments with user info', async () => {
      const comments = await getPrComments(gh, TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(comments).toContain('User:');
    });

    it('should return empty string for PR with no comments', async () => {
      const comments = await getPrComments(gh, TEST_OWNER, TEST_REPO, 99999999);
      expect(comments).toBe('');
    });
  });

  describe('findPrByBranch', () => {
    it('should find PR by branch name', async () => {
      const prNumber = await findPrByBranch(gh, TEST_OWNER, TEST_REPO, TEST_BRANCH_NAME);
      expect(prNumber).toBe(String(TEST_PR_NUMBER));
    });

    it('should return empty string for non-existent branch', async () => {
      const prNumber = await findPrByBranch(gh, TEST_OWNER, TEST_REPO, 'non-existent-branch-xyz');
      expect(prNumber).toBe('');
    });

    it('should search with correct owner:branch format', async () => {
      const prNumber = await findPrByBranch(gh, TEST_OWNER, TEST_REPO, TEST_BRANCH_NAME);
      // The function searches with head: "owner:branchName" format
      expect(prNumber.length).toBeGreaterThan(0);
    });
  });
});
