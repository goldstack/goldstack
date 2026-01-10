# Test Plan for GitHub Actions Agent CLI

## Overview

This document outlines the test strategy for the `github-actions-agent` library. Tests will use real GitHub API calls (no mocking) against the actual `goldstack/goldstack` repository, using issue #518 and PR #519 as test fixtures.

## Test Fixtures

| Resource | Value | Description |
|----------|-------|-------------|
| Issue #518 | `kilo-issue-518` branch | Test issue for github-actions-agent |
| PR #519 | `kilo-issue-518` branch | Test PR linked to issue #518 |
| Repository | `goldstack/goldstack` | Target repository for all tests |

---

## Test Suite 1: identify-branch.spec.ts

### Test Cases

#### TC1.1: Identify Branch from PR Number
**Scenario**: Given a PR number exists, return the PR's head branch name.

```typescript
// Input
issueNumber: 518
prNumber: 519

// Expected Output
branchName: 'kilo-issue-518'
```

**Rationale**: When a PR exists, the function should extract the branch name from the PR's head ref, not default to `kilo-issue-{issueNumber}`.

#### TC1.2: Identify Branch from Issue Only (No PR)
**Scenario**: Given only an issue number (no PR), return the default kilo-issue branch.

```typescript
// Input
issueNumber: 518
prNumber: undefined

// Expected Output
branchName: 'kilo-issue-518'
```

**Rationale**: When no PR exists, the function should default to `kilo-issue-{issueNumber}` pattern.

---

## Test Suite 2: identify-comment.spec.ts

### Test Cases

#### TC2.1: Identify PR Comment
**Scenario**: Comment is on a PR, should return the PR number.

```typescript
// Input
comment: '/kilo fix the bug'
issueNumber: 519  // PR number

// Expected Output
issueNumber: 519
prNumber: '519'
isPrComment: true
```

**Rationale**: When the issue number refers to a PR, `isPrComment` should be `true` and `prNumber` should match.

#### TC2.2: Identify Issue Comment with PR Reference in Body
**Scenario**: Comment is on an issue that has a PR with "closes #XXX" pattern.

```typescript
// Input
comment: '/kilo fix the bug'
issueNumber: 518  // Issue number

// Expected Output
issueNumber: 518
prNumber: '519'  // Extracted from PR body closes #518
isPrComment: false
```

**Rationale**: Should parse PR body for "closes #", "fixes #", "resolves #" patterns.

---

## Test Suite 3: build-context.spec.ts

### Test Cases

#### TC3.1: Build Context from Issue Only
**Scenario**: Build task context when only issue is available.

```typescript
// Input
comment: '/kilo fix the bug'
issueNumber: 518
prNumber: undefined

// Expected Output
{
  branchName: 'kilo-issue-518',
  prNumber: '',
  task: contains 'PR #518: Test Issue...' AND 'ISSUE COMMENTS: First comment on issue' AND 'TASK: fix the bug'
}
```

**Rationale**: Should include issue title, body, and comments in the task context.

#### TC3.2: Build Context from PR
**Scenario**: Build task context when PR is available.

```typescript
// Input
comment: '/kilo review this'
issueNumber: 518
prNumber: 519

// Expected Output
{
  branchName: 'kilo-issue-518',
  prNumber: '519',
  task: contains 'PR #519: This is what the PR is about.' AND 'PR COMMENTS: First PR comment.' AND 'TASK: review this'
}
```

**Rationale**: Should include PR title, body, and comments when PR is available.

---

## Test Suite 4: github-utils.spec.ts

### Test Cases

#### TC4.1: isPr Function
**Scenario**: Verify isPr returns true for PR #519 and false for issue #518.

```typescript
// Test
expect(await isPr(octokit, 'goldstack', 'goldstack', 519)).toBe(true)
expect(await isPr(octokit, 'goldstack', 'goldstack', 518)).toBe(false)
```

#### TC4.2: getPrData Function
**Scenario**: Retrieve PR #519 data and verify structure.

```typescript
// Test
const prData = await getPrData(octokit, 'goldstack', 'goldstack', 519)
expect(prData).toEqual({
  title: 'This is what the PR is about.',
  body: expect.any(String),
  headRefName: 'kilo-issue-518'
})
```

#### TC4.3: getIssueData Function
**Scenario**: Retrieve issue #518 data and verify structure.

```typescript
// Test
const issueData = await getIssueData(octokit, 'goldstack', 'goldstack', 518)
expect(issueData).toEqual({
  title: 'Test Issue: Only used during Testing for github-actions-agent',
  body: 'This is the description.'
})
```

#### TC4.4: getIssueComments Function
**Scenario**: Retrieve comments for issue #518.

```typescript
// Test
const comments = await getIssueComments(octokit, 'goldstack', 'goldstack', 518)
expect(comments).toContain('First comment on issue')
```

#### TC4.5: getPrComments Function
**Scenario**: Retrieve comments for PR #519.

```typescript
// Test
const comments = await getPrComments(octokit, 'goldstack', 'goldstack', 519)
expect(comments).toContain('First PR comment')
```

#### TC4.6: findPrByBranch Function
**Scenario**: Find PR by branch name `kilo-issue-518`.

```typescript
// Test
const prNumber = await findPrByBranch(octokit, 'goldstack', 'goldstack', 'kilo-issue-518')
expect(prNumber).toBe('519')
```

---

## Test Suite 5: github-actions-agent.spec.ts (Integration)

### Test Cases

#### TC5.1: Full Workflow - Issue Only (Mock runKilocode)
**Scenario**: Run complete workflow when only issue is available.

```typescript
// Mock runKilocode to avoid actual execution
// Run with: comment: '/kilo test', issueNumber: 518

// Verify
expect(identifyComment).toHaveBeenCalled()
expect(identifyBranch).toHaveBeenCalledWith({ issueNumber: 518, prNumber: '519' })
```

#### TC5.2: Full Workflow - With PR (Mock runKilocode)
**Scenario**: Run complete workflow when PR is available.

```typescript
// Mock runKilocode to avoid actual execution
// Run with: comment: '/kilo test', issueNumber: 518, prNumber: 519

// Verify
expect(identifyBranch).toHaveBeenCalledWith({ issueNumber: 518, prNumber: '519' })
expect(buildContext).toHaveBeenCalled()
```

---

## Test Configuration

### Environment Variables Required
```bash
GITHUB_TOKEN=your_personal_access_token
KILOCODE_API_KEY=your_kilocode_api_key  # Can be dummy for most tests
```

### Jest Configuration
- Test files: `src/__tests__/*.spec.ts`
- Test timeout: 30000ms (due to API calls)
- Run tests sequentially: `--runInBand` (already configured)

---

## Execution Order

1. **github-utils.spec.ts** - Test low-level GitHub API functions first
2. **identify-branch.spec.ts** - Test branch identification logic
3. **identify-comment.spec.ts** - Test comment parsing logic
4. **build-context.spec.ts** - Test context building logic
5. **github-actions-agent.spec.ts** - Integration tests

---

## Notes

- Tests use real GitHub API to ensure actual behavior is tested
- API rate limits may apply; consider using authenticated requests
- Some tests (like `postStartComment`, `fixPrBody`, `createPr`) modify data and should be run with caution or skipped in CI
- Consider adding test isolation with unique issues/PRs for destructive operations
