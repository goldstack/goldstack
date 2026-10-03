#!/usr/bin/env bash
#
# Scenarios for scripts/publish-agent-commits.sh.
#
# Each fixture is a bare repository standing in for `origin`, the agent's clone
# (`work`), and a genuinely separate actor's clone (`third`). `work` and `third`
# never share a `.git`, which is what makes the lease scenario meaningful: a push
# made from `work` would update work's own remote-tracking ref and hide the very
# divergence the lease exists to detect.
#
# Run with: bash scripts/publish-agent-commits.test.sh

set -euo pipefail

script="$(cd "$(dirname "$0")" && pwd)/publish-agent-commits.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

export GIT_AUTHOR_NAME="Agent Test"
export GIT_AUTHOR_EMAIL="agent-test@example.com"
export GIT_COMMITTER_NAME="Agent Test"
export GIT_COMMITTER_EMAIL="agent-test@example.com"
export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_SYSTEM=/dev/null

passed=0
failed=0

assert_eq() {
  if [ "$1" = "$2" ]; then
    echo "  PASS: $3"
    passed=$((passed + 1))
  else
    echo "  FAIL: $3 (expected '$2', got '$1')" >&2
    failed=$((failed + 1))
  fi
}

assert_contains() {
  case "$1" in
    *"$2"*)
      echo "  PASS: $3"
      passed=$((passed + 1))
      ;;
    *)
      echo "  FAIL: $3 (output missing '$2')" >&2
      failed=$((failed + 1))
      ;;
  esac
}

# Builds $1/origin.git with `master` (base) and `work/branch` (prior on base),
# then clones `work` and `third` from it.
make_fixture() {
  local base="$1"
  mkdir -p "$base"
  git init -q --bare -b master "$base/origin.git"
  git init -q -b master "$base/seed"
  echo base > "$base/seed/base.txt"
  git -C "$base/seed" add .
  git -C "$base/seed" commit -q -m base
  git -C "$base/seed" checkout -q -b prior
  echo prior > "$base/seed/prior.txt"
  git -C "$base/seed" add .
  git -C "$base/seed" commit -q -m prior
  git -C "$base/seed" remote add origin "$base/origin.git"
  git -C "$base/seed" push -q origin master
  git -C "$base/seed" push -q origin prior:refs/heads/work/branch
  git clone -q "$base/origin.git" "$base/work"
  git clone -q "$base/origin.git" "$base/third"
  git -C "$base/work" checkout -q work/branch
  git -C "$base/third" checkout -q work/branch
}

remote_tip() {
  git -C "$1/origin.git" rev-parse refs/heads/work/branch
}

work_head() {
  git -C "$1/work" rev-parse HEAD
}

run_in_work() {
  ( cd "$1/work" && DEFAULT_BRANCH=master "$script" )
}

echo "Scenario 1: fast-forward is published"
base="$tmp/s1"
make_fixture "$base"
echo ff >> "$base/work/prior.txt"
git -C "$base/work" add .
git -C "$base/work" commit -q -m ff
if run_in_work "$base" > /dev/null 2>&1; then
  assert_eq "$(remote_tip "$base")" "$(work_head "$base")" "origin matches the agent's fast-forward"
else
  echo "  FAIL: fast-forward push was rejected" >&2
  failed=$((failed + 1))
fi

echo "Scenario 2: a rewritten branch is republished"
base="$tmp/s2"
make_fixture "$base"
git -C "$base/work" commit -q --amend -m "prior rebased"
if run_in_work "$base" > /dev/null 2>&1; then
  assert_eq "$(remote_tip "$base")" "$(work_head "$base")" "origin matches the rewritten tip"
else
  echo "  FAIL: rewritten branch was not republished" >&2
  failed=$((failed + 1))
fi

echo "Scenario 3: a genuine concurrent push is refused"
base="$tmp/s3"
make_fixture "$base"
echo third >> "$base/third/prior.txt"
git -C "$base/third" add .
git -C "$base/third" commit -q -m third
git -C "$base/third" push -q origin work/branch
third_tip="$(remote_tip "$base")"
assert_eq "$(git -C "$base/work" rev-parse origin/work/branch)" "$(git -C "$base/seed" rev-parse prior)" "work still sees the pre-third tip as its lease base"
echo agent >> "$base/work/prior.txt"
git -C "$base/work" add .
git -C "$base/work" commit -q -m agent
set +e
out="$(run_in_work "$base" 2>&1)"
status=$?
set -e
assert_eq "$status" "1" "the push is refused"
assert_contains "$out" "stale info" "the refusal is a stale lease"
assert_eq "$(remote_tip "$base")" "$third_tip" "the third party's commit is preserved"

echo "Scenario 3b: the agent's own mid-run push is allowed"
base="$tmp/s3b"
make_fixture "$base"
echo own >> "$base/work/prior.txt"
git -C "$base/work" add .
git -C "$base/work" commit -q -m own
git -C "$base/work" push -q origin work/branch
echo more >> "$base/work/prior.txt"
git -C "$base/work" add .
git -C "$base/work" commit -q -m more
if run_in_work "$base" > /dev/null 2>&1; then
  assert_eq "$(remote_tip "$base")" "$(work_head "$base")" "the agent may overwrite its own commits"
else
  echo "  FAIL: the agent's own mid-run push was refused" >&2
  failed=$((failed + 1))
fi

echo "Scenario 4: nothing ahead is a no-op"
base="$tmp/s4"
make_fixture "$base"
before="$(remote_tip "$base")"
out="$(run_in_work "$base" 2>&1)"
assert_contains "$out" "nothing to publish" "no-op is reported"
assert_eq "$(remote_tip "$base")" "$before" "origin is untouched"

echo "Scenario 5: an unknown remote branch is a no-op"
base="$tmp/s5"
make_fixture "$base"
git -C "$base/work" checkout -q -b local-only
out="$(run_in_work "$base" 2>&1)"
assert_contains "$out" "unknown" "unknown branch is reported"

echo "Scenario 6: the default branch is never pushed"
base="$tmp/s6"
make_fixture "$base"
git -C "$base/work" checkout -q master
out="$(run_in_work "$base" 2>&1)"
assert_contains "$out" "not an agent branch" "the default branch is skipped"

echo
echo "Passed: $passed  Failed: $failed"
[ "$failed" -eq 0 ]
