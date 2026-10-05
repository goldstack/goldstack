#!/usr/bin/env bash
#
# Publish the agent's commits at the end of a GitHub Actions run.
#
# The opencode action pushes its own branch with a bare `git push`. When the
# agent rewrote history during the run (a rebase, or an amend of an already
# pushed commit), that push is rejected as non-fast-forward and the run's
# verified work is discarded. This script is the deterministic safety net: the
# workflow runs it after the agent and it republishes the branch.
#
# The push is always guarded by a lease pinned to the remote tip captured at
# checkout (`origin/<branch>`, with no fetch in between). That means:
#   - a true fast-forward is allowed;
#   - the agent's own rewrite is allowed, since its remote-tracking ref still
#     points at what it checked out;
#   - a branch someone else moved during the run is refused with `stale info`,
#     so their commit is never clobbered.
#
# Environment:
#   DEFAULT_BRANCH  the repository default branch (never a push target)
#   GITHUB_OUTPUT   optional; step outputs are written when set

set -euo pipefail

branch="$(git branch --show-current)"
if [ -z "$branch" ] || [ "$branch" = "HEAD" ] || [ "$branch" = "${DEFAULT_BRANCH:-}" ]; then
  echo "::notice::Checked out '$branch' is not an agent branch; nothing to publish."
  echo "published=false" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi

remote_ref="refs/remotes/origin/$branch"
if ! git rev-parse --verify --quiet "$remote_ref" > /dev/null; then
  echo "::notice::origin/$branch is unknown; there is no push to recover."
  echo "published=false" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi

remote_tip="$(git rev-parse "$remote_ref")"
ahead="$(git rev-list --count "$remote_ref..HEAD" 2>/dev/null || echo 0)"
if [ "$ahead" = "0" ]; then
  echo "::notice::$remote_ref already contains HEAD; nothing to publish."
  echo "published=false" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi

if git merge-base --is-ancestor "$remote_tip" HEAD; then
  mode="fast-forward"
else
  mode="force-with-lease"
fi

echo "Publishing $branch by $ahead commit(s) using $mode..."
git push --force-with-lease="refs/heads/$branch:$remote_tip" origin "HEAD:refs/heads/$branch"

{
  echo "branch=$branch"
  echo "mode=$mode"
  echo "published=true"
} >> "${GITHUB_OUTPUT:-/dev/null}"
