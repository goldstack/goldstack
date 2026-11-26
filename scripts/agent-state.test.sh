#!/usr/bin/env bash
#
# Scenarios for scripts/agent-state.sh.
#
# The gh and tea CLIs are replaced by small fakes on PATH. They record every
# label and comment operation, so the assertions cover both the forge calls and
# the comment grammar the script owns.
#
# Run with: bash scripts/agent-state.test.sh

set -euo pipefail

script="$(cd "$(dirname "$0")" && pwd)/agent-state.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

export FAKE_LOG="$tmp/log"
export FAKE_COMMENTS="$tmp/comments.jsonl"
mkdir -p "$tmp/bin"
: > "$FAKE_LOG"
: > "$FAKE_COMMENTS"
export PATH="$tmp/bin:$PATH"

cat > "$tmp/bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
set -euo pipefail
log() { printf '%s\n' "$*" >> "$FAKE_LOG"; }
cmd="${1:-}"
shift || true
case "$cmd" in
  label)
    sub="${1:-}"
    shift || true
    name="${1:-}"
    log "gh-label-$sub $name"
    ;;
  api)
    log "gh-api"
    [ -s "$FAKE_COMMENTS" ] && jq -r '.body' "$FAKE_COMMENTS"
    ;;
  issue | pr)
    sub="${1:-}"
    shift || true
    case "$sub" in
      comment)
        body=""
        while [ $# -gt 0 ]; do
          case "$1" in
            --body)
              body="$2"
              shift 2
              ;;
            *) shift ;;
          esac
        done
        log "gh-$cmd-comment"
        jq -n --arg body "$body" '{body:$body}' >> "$FAKE_COMMENTS"
        ;;
      edit)
        label=""
        action=""
        while [ $# -gt 0 ]; do
          case "$1" in
            --add-label)
              label="$2"
              action=add
              shift 2
              ;;
            --remove-label)
              label="$2"
              action=remove
              shift 2
              ;;
            *) shift ;;
          esac
        done
        log "gh-$cmd-edit-$action $label"
        ;;
    esac
    ;;
esac
FAKE_GH

cat > "$tmp/bin/tea" <<'FAKE_TEA'
#!/usr/bin/env bash
set -euo pipefail
log() { printf '%s\n' "$*" >> "$FAKE_LOG"; }
cmd="${1:-}"
shift || true
case "$cmd" in
  labels)
    sub="${1:-}"
    shift || true
    name=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --name)
          name="$2"
          shift 2
          ;;
        *) shift ;;
      esac
    done
    log "tea-label-$sub $name"
    ;;
  comments)
    sub="${1:-}"
    shift || true
    case "$sub" in
      list)
        log "tea-comments-list"
        jq -s '.' "$FAKE_COMMENTS" 2>/dev/null || printf '[]'
        ;;
      add)
        body=""
        while [ $# -gt 0 ]; do
          case "$1" in
            --description)
              body="$2"
              shift 2
              ;;
            *) shift ;;
          esac
        done
        log "tea-comments-add"
        jq -n --arg body "$body" '{body:$body}' >> "$FAKE_COMMENTS"
        ;;
    esac
    ;;
  issues | pulls)
    sub="${1:-}"
    shift || true
    label=""
    action=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --add-labels)
          label="$2"
          action=add
          shift 2
          ;;
        --remove-labels)
          label="$2"
          action=remove
          shift 2
          ;;
        *) shift ;;
      esac
    done
    log "tea-$cmd-edit-$action $label"
    ;;
esac
FAKE_TEA

chmod +x "$tmp/bin/gh" "$tmp/bin/tea"

passed=0
failed=0

pass() {
  echo "  PASS: $1"
  passed=$((passed + 1))
}

fail() {
  echo "  FAIL: $1" >&2
  failed=$((failed + 1))
}

assert_eq() {
  if [ "$1" = "$2" ]; then
    pass "$3"
  else
    fail "$3 (expected '$2', got '$1')"
  fi
}

assert_contains() {
  case "$1" in
    *"$2"*) pass "$3" ;;
    *) fail "$3 (missing '$2' in '$1')" ;;
  esac
}

assert_not_contains() {
  case "$1" in
    *"$2"*) fail "$3 (unexpected '$2' in '$1')" ;;
    *) pass "$3" ;;
  esac
}

assert_log_has() {
  if grep -Fqx -- "$1" "$FAKE_LOG"; then
    pass "$2"
  else
    fail "$2 (log has no '$1')"
  fi
}

assert_log_lacks() {
  if grep -Fqx -- "$1" "$FAKE_LOG"; then
    fail "$2 (log unexpectedly has '$1')"
  else
    pass "$2"
  fi
}

reset() {
  : > "$FAKE_LOG"
  : > "$FAKE_COMMENTS"
}

comment_count() {
  jq -s 'length' "$FAKE_COMMENTS"
}

comment_body() {
  jq -r -s --argjson index "$1" '.[$index].body // ""' "$FAKE_COMMENTS"
}

comment_line() {
  printf '%s\n' "$1" | sed -n "$2p"
}

echo "Scenario 1: GitHub start creates labels, adds working and posts the contract"
reset
bash "$script" start \
  --forge gh --repo owner/repo --kind pr --number 123 --mode ci \
  --actor wrangler --title "Fix login timeout" --run-url "https://example.test/runs/1"
assert_log_has "gh-label-create agent:working" "agent:working label is ensured"
assert_log_has "gh-label-create agent:needs-human" "agent:needs-human label is ensured"
assert_log_has "gh-pr-edit-add agent:working" "agent:working is added to the PR"
assert_eq "$(comment_count)" "1" "one start comment is posted"
body="$(comment_body 0)"
assert_eq "$(comment_line "$body" 1)" \
  "Wrangler: work started on pull request #123: Fix login timeout." \
  "start comment has the contract first line"
assert_eq "$(comment_line "$body" 2)" \
  "Mode: ci · Run: https://example.test/runs/1" \
  "start comment has the metadata line"

echo "Scenario 2: a second start for the same run is deduplicated"
bash "$script" start \
  --forge gh --repo owner/repo --kind pr --number 123 --mode ci \
  --actor wrangler --title "Fix login timeout" --run-url "https://example.test/runs/1"
assert_eq "$(comment_count)" "1" "no duplicate start comment for the same run URL"
assert_log_has "gh-pr-edit-add agent:working" "the working label is still ensured"

echo "Scenario 3: a new run posts its own start comment"
bash "$script" start \
  --forge gh --repo owner/repo --kind pr --number 123 --mode ci \
  --actor wrangler --title "Fix login timeout" --run-url "https://example.test/runs/2"
assert_eq "$(comment_count)" "2" "a different run URL posts another start comment"

echo "Scenario 4: GitHub success finish removes working and reports success"
reset
bash "$script" finish \
  --forge gh --repo owner/repo --kind pr --number 123 \
  --actor wrangler --result success --title "Fix login timeout" \
  --run-url "https://example.test/runs/3"
assert_log_has "gh-pr-edit-remove agent:working" "agent:working is removed"
assert_log_lacks "gh-pr-edit-add agent:needs-human" "success does not add needs-human"
body="$(comment_body 0)"
assert_eq "$(comment_line "$body" 1)" \
  "Wrangler: done on pull request #123: Fix login timeout." \
  "finish comment has the done first line"
assert_eq "$(comment_line "$body" 2)" \
  "Result: success · Run: https://example.test/runs/3" \
  "finish comment has the result line"
assert_not_contains "$body" "work started" "finish comment never contains work started"

echo "Scenario 5: GitHub failure finish adds needs-human and keeps the detail"
reset
bash "$script" finish \
  --forge gh --repo owner/repo --kind issue --number 7 \
  --actor agent --result failed --detail "exit 1" --title "Fix login timeout" \
  --run-url "https://example.test/runs/4"
assert_log_has "gh-issue-edit-remove agent:working" "agent:working is removed on failure"
assert_log_has "gh-issue-edit-add agent:needs-human" "agent:needs-human is added on failure"
body="$(comment_body 0)"
assert_eq "$(comment_line "$body" 1)" \
  "Agent: work finished on issue #7: Fix login timeout." \
  "Agent finish comment uses the work finished form"
assert_eq "$(comment_line "$body" 2)" \
  "Result: failed (exit 1) · Run: https://example.test/runs/4" \
  "failure detail is included in the result line"
assert_not_contains "$body" "work started" "failure comment never contains work started"

echo "Scenario 6: blocked and merged finishes use their own wording"
reset
bash "$script" finish \
  --forge gh --repo owner/repo --kind pr --number 9 \
  --actor wrangler --result blocked --detail "checks are pending" \
  --title "Blocked change" --run-url "https://example.test/runs/5"
assert_log_has "gh-pr-edit-add agent:needs-human" "blocked adds needs-human"
body="$(comment_body 0)"
assert_eq "$(comment_line "$body" 1)" \
  "Wrangler: blocked on pull request #9: Blocked change." \
  "blocked comment uses the blocked first line"
assert_eq "$(comment_line "$body" 2)" \
  "Result: blocked (checks are pending) · Run: https://example.test/runs/5" \
  "blocked detail is included in the result line"

reset
bash "$script" finish \
  --forge gh --repo owner/repo --kind pr --number 9 \
  --actor wrangler --result merged --merge-sha "abc123" \
  --title "Blocked change" --run-url "https://example.test/runs/6"
assert_log_lacks "gh-pr-edit-add agent:needs-human" "merged does not add needs-human"
body="$(comment_body 0)"
assert_eq "$(comment_line "$body" 1)" \
  "Wrangler: merged as abc123 on pull request #9: Blocked change." \
  "merged comment includes the merge SHA"
assert_eq "$(comment_line "$body" 2)" \
  "Result: merged · Run: https://example.test/runs/6" \
  "merged result line is present"

echo "Scenario 7: Gitea start and deduplication use tea"
reset
bash "$script" start \
  --forge tea --repo owner/repo --kind pr --number 42 --mode ci \
  --actor wrangler --title "Tea change" --run-url "https://gitea.test/runs/1"
assert_log_has "tea-label-create agent:working" "Gitea working label is ensured"
assert_log_has "tea-label-create agent:needs-human" "Gitea needs-human label is ensured"
assert_log_has "tea-pulls-edit-add agent:working" "Gitea working label is added"
assert_log_has "tea-comments-add" "Gitea comment is posted"
body="$(comment_body 0)"
assert_eq "$(comment_line "$body" 1)" \
  "Wrangler: work started on pull request #42: Tea change." \
  "Gitea start comment has the contract first line"

bash "$script" start \
  --forge tea --repo owner/repo --kind pr --number 42 --mode ci \
  --actor wrangler --title "Tea change" --run-url "https://gitea.test/runs/1"
assert_eq "$(comment_count)" "1" "Gitea start comment is deduplicated"

echo "Scenario 8: Gitea finish updates labels and comments"
reset
bash "$script" finish \
  --forge tea --repo owner/repo --kind issue --number 43 \
  --actor agent --result timeout --detail "60 minutes" \
  --title "Tea issue" --run-url "https://gitea.test/runs/2"
assert_log_has "tea-issues-edit-remove agent:working" "Gitea working label is removed"
assert_log_has "tea-issues-edit-add agent:needs-human" "Gitea needs-human label is added on timeout"
body="$(comment_body 0)"
assert_eq "$(comment_line "$body" 1)" \
  "Agent: work timed out on issue #43: Tea issue." \
  "Gitea timeout uses the work timed out form"
assert_eq "$(comment_line "$body" 2)" \
  "Result: timeout (60 minutes) · Run: https://gitea.test/runs/2" \
  "Gitea timeout result line is present"

echo "Scenario 9: cancelled does not ask for a human"
reset
bash "$script" finish \
  --forge gh --repo owner/repo --kind pr --number 11 \
  --actor agent --result cancelled --title "Cancelled change" \
  --run-url "https://example.test/runs/7"
assert_log_lacks "gh-pr-edit-add agent:needs-human" "cancelled does not add needs-human"
assert_log_has "gh-pr-edit-remove agent:working" "cancelled still removes working"

echo "Scenario 10: invalid input is rejected"
reset
set +e
bash "$script" start --forge gh --repo owner/repo --kind pr --number 1 --actor wrangler \
  >/dev/null 2>&1
status=$?
set -e
assert_eq "$status" "2" "a missing --mode is rejected"

echo
echo "Passed: $passed  Failed: $failed"
[ "$failed" -eq 0 ]
