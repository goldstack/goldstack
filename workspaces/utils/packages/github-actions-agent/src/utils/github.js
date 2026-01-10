"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOctokit = createOctokit;
exports.isPr = isPr;
exports.getPrData = getPrData;
exports.getIssueData = getIssueData;
exports.getIssueComments = getIssueComments;
exports.getPrComments = getPrComments;
exports.getPrReviewComments = getPrReviewComments;
exports.findPrByBranch = findPrByBranch;
exports.createComment = createComment;
exports.createDraftPr = createDraftPr;
exports.getPrBody = getPrBody;
exports.updatePrBody = updatePrBody;
var rest_1 = require("@octokit/rest");
/**
 * Create an Octokit client using the provided token.
 */
function createOctokit(token) {
    return new rest_1.Octokit({
        auth: token,
    });
}
/**
 * Check if a PR exists for the given number.
 */
function isPr(octokit, owner, repo, prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, octokit.pulls.get({
                            owner: owner,
                            repo: repo,
                            pull_number: prNumber,
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get PR data.
 */
function getPrData(octokit, owner, repo, prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.get({
                        owner: owner,
                        repo: repo,
                        pull_number: prNumber,
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, {
                            title: data.title,
                            body: data.body || '',
                            headRefName: data.head.ref,
                        }];
            }
        });
    });
}
/**
 * Get issue data.
 */
function getIssueData(octokit, owner, repo, issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.issues.get({
                        owner: owner,
                        repo: repo,
                        issue_number: issueNumber,
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, {
                            title: data.title,
                            body: data.body || '',
                        }];
            }
        });
    });
}
/**
 * Get issue comments.
 */
function getIssueComments(octokit, owner, repo, issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.issues.listComments({
                        owner: owner,
                        repo: repo,
                        issue_number: issueNumber,
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data
                            .map(function (comment) {
                            var _a;
                            return "User: ".concat(((_a = comment.user) === null || _a === void 0 ? void 0 : _a.login) || 'unknown', "\n").concat(comment.body);
                        })
                            .join('\n\n---\n\n')];
            }
        });
    });
}
/**
 * Get PR comments.
 */
function getPrComments(octokit, owner, repo, prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.issues.listComments({
                        owner: owner,
                        repo: repo,
                        issue_number: prNumber,
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data
                            .map(function (comment) {
                            var _a;
                            return "User: ".concat(((_a = comment.user) === null || _a === void 0 ? void 0 : _a.login) || 'unknown', "\n").concat(comment.body);
                        })
                            .join('\n\n---\n\n')];
            }
        });
    });
}
/**
 * Get PR review comments on or after the given SHA.
 */
function getPrReviewComments(octokit, owner, repo, prNumber, sinceSha) {
    return __awaiter(this, void 0, void 0, function () {
        var data, comments, sinceIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.listReviewComments({
                        owner: owner,
                        repo: repo,
                        pull_number: prNumber,
                    })];
                case 1:
                    data = (_a.sent()).data;
                    comments = data;
                    if (sinceSha) {
                        sinceIndex = data.findIndex(function (comment) { return comment.commit_id === sinceSha; });
                        if (sinceIndex !== -1) {
                            comments = data.slice(sinceIndex);
                        }
                    }
                    return [2 /*return*/, comments
                            .slice(0, 50)
                            .map(function (comment) {
                            var _a;
                            return "User: ".concat(((_a = comment.user) === null || _a === void 0 ? void 0 : _a.login) || 'unknown', "\nFile: ").concat(comment.path, "\n").concat(comment.body);
                        })
                            .join('\n\n---\n\n')];
            }
        });
    });
}
/**
 * Check for existing PR with the given branch head.
 */
function findPrByBranch(octokit, owner, repo, branchName) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.list({
                        owner: owner,
                        repo: repo,
                        head: "".concat(owner, ":").concat(branchName),
                        state: 'open',
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data.length > 0 ? String(data[0].number) : ''];
            }
        });
    });
}
/**
 * Create a comment on an issue or PR.
 */
function createComment(octokit, owner, repo, issueNumber, body, _isPr) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.issues.createComment({
                        owner: owner,
                        repo: repo,
                        issue_number: issueNumber,
                        body: body,
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a draft PR.
 */
function createDraftPr(octokit, owner, repo, title, body, head) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.create({
                        owner: owner,
                        repo: repo,
                        title: title,
                        body: body,
                        head: head,
                        base: 'master',
                        draft: true,
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, String(data.number)];
            }
        });
    });
}
/**
 * Get PR body.
 */
function getPrBody(octokit, owner, repo, prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.get({
                        owner: owner,
                        repo: repo,
                        pull_number: prNumber,
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data.body || ''];
            }
        });
    });
}
/**
 * Update PR body.
 */
function updatePrBody(octokit, owner, repo, prNumber, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.pulls.update({
                        owner: owner,
                        repo: repo,
                        pull_number: prNumber,
                        body: body,
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
