"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGit = configureGit;
exports.gitFetch = gitFetch;
exports.gitCheckout = gitCheckout;
exports.gitPull = gitPull;
exports.gitCreateBranch = gitCreateBranch;
exports.gitPush = gitPush;
exports.getCurrentSha = getCurrentSha;
exports.branchExistsRemote = branchExistsRemote;
exports.getCommitCount = getCommitCount;
var child_process_1 = require("child_process");
/**
 * Execute a git command and return the output.
 */
function gitExec(args) {
    return (0, child_process_1.execSync)("git ".concat(args.join(' ')), {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
    });
}
/**
 * Configure git user.
 */
function configureGit(userName, userEmail) {
    gitExec(['config', 'user.name', userName]);
    gitExec(['config', 'user.email', userEmail]);
}
/**
 * Fetch all remote branches.
 */
function gitFetch() {
    gitExec(['fetch', 'origin']);
}
/**
 * Checkout a branch.
 */
function gitCheckout(branchName) {
    gitExec(['checkout', branchName]);
}
/**
 * Pull from a branch.
 */
function gitPull(branchName) {
    gitExec(['pull', 'origin', branchName]);
}
/**
 * Create a new branch and checkout.
 */
function gitCreateBranch(branchName) {
    gitExec(['checkout', '-b', branchName]);
}
/**
 * Push a branch to origin.
 */
function gitPush(branchName) {
    gitExec(['push', 'origin', branchName]);
}
/**
 * Get the current HEAD SHA.
 */
function getCurrentSha() {
    return gitExec(['rev-parse', 'HEAD']).trim();
}
/**
 * Check if a branch exists remotely.
 */
function branchExistsRemote(branchName) {
    try {
        gitExec(['ls-remote', '--exit-code', '--heads', 'origin', branchName]);
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Get the number of commits on the branch compared to master.
 */
function getCommitCount(branchName, baseBranch) {
    try {
        var count = gitExec([
            'rev-list',
            '--count',
            "HEAD ^origin/".concat(baseBranch),
        ]).trim();
        return parseInt(count, 10);
    }
    catch (_a) {
        return 0;
    }
}
