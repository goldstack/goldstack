#!/usr/bin/env bash
#
# Manage the visible working state of an agent on an issue or pull request.
#
# The caller only supplies data (item, result, run URL); this script owns the
# label names, colours, descriptions and the comment grammar. It works with both
# GitHub (`gh`) and Gitea (`tea`).
#
# Start:
#   Ensures the agent labels exist, adds `agent:working` and posts a start
#   comment. A start comment is not repeated when the same run URL or session
#   already has one.
#
# Finish:
#   Ensures the agent labels exist, removes `agent:working`, adds
#   `agent:needs-human` for a failed, timed-out or blocked run, and posts the
#   result comment. The result comment never contains `work started`.
#
# Run `scripts/agent-state.sh --help` for the full interface.

set -euo pipefail

WORKING_LABEL="agent:working"
WORKING_COLOR="#fbca04"
WORKING_DESCRIPTION="An agent is actively working on this item"
NEEDS_HUMAN_LABEL="agent:needs-human"
NEEDS_HUMAN_COLOR="#d93f0b"
NEEDS_HUMAN_DESCRIPTION="An agent needs a human decision, information or access"

usage() {
  cat <<'EOF'
Usage:
  agent-state start  --forge gh|tea --repo <owner/repo> --kind pr|issue --number <n>
                     --mode ci|background|interactive [--actor wrangler|agent]
                     [--title <text>] [--session <text>] [--run-url <url>]
  agent-state finish --forge gh|tea --repo <owner/repo> --kind pr|issue --number <n>
                     --result success|failed|timeout|cancelled|blocked|merged
                     [--actor wrangler|agent] [--detail <text>] [--merge-sha <sha>]
                     [--title <text>] [--session <text>] [--run-url <url>]

The script creates the agent:working and agent:needs-human labels when they are
missing, adds/removes the working label, adds needs-human on failure, timeout or
blocked, and posts the start/finish comment. Start comments are deduplicated by
run URL (or session when no run URL is given).
EOF
}

die() {
  echo "agent-state: $*" >&2
  exit 2
}

warn() {
  echo "agent-state: $*" >&2
}

command="${1:-}"
case "$command" in
  start | finish)
    shift
    ;;
  '' | -h | --help | help)
    usage
    exit 0
    ;;
  *)
    die "unknown command '$command' (expected start or finish)"
    ;;
esac

forge=""
repo=""
kind=""
number=""
mode=""
title=""
session=""
run_url=""
result=""
detail=""
merge_sha=""
actor="agent"

while [ $# -gt 0 ]; do
  case "$1" in
    --forge)
      [ $# -ge 2 ] || die "missing value for --forge"
      forge="$2"
      shift 2
      ;;
    --repo)
      [ $# -ge 2 ] || die "missing value for --repo"
      repo="$2"
      shift 2
      ;;
    --kind)
      [ $# -ge 2 ] || die "missing value for --kind"
      kind="$2"
      shift 2
      ;;
    --number)
      [ $# -ge 2 ] || die "missing value for --number"
      number="$2"
      shift 2
      ;;
    --mode)
      [ $# -ge 2 ] || die "missing value for --mode"
      mode="$2"
      shift 2
      ;;
    --title)
      [ $# -ge 2 ] || die "missing value for --title"
      title="$2"
      shift 2
      ;;
    --session)
      [ $# -ge 2 ] || die "missing value for --session"
      session="$2"
      shift 2
      ;;
    --run-url)
      [ $# -ge 2 ] || die "missing value for --run-url"
      run_url="$2"
      shift 2
      ;;
    --result)
      [ $# -ge 2 ] || die "missing value for --result"
      result="$2"
      shift 2
      ;;
    --detail)
      [ $# -ge 2 ] || die "missing value for --detail"
      detail="$2"
      shift 2
      ;;
    --merge-sha)
      [ $# -ge 2 ] || die "missing value for --merge-sha"
      merge_sha="$2"
      shift 2
      ;;
    --actor)
      [ $# -ge 2 ] || die "missing value for --actor"
      actor="$2"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      die "unknown option '$1'"
      ;;
  esac
done

[ -n "$forge" ] || die "--forge is required"
case "$forge" in
  gh | tea) ;;
  *) die "--forge must be gh or tea" ;;
esac
[ -n "$repo" ] || die "--repo is required"
case "$kind" in
  pr | issue) ;;
  *) die "--kind must be pr or issue" ;;
esac
[[ "$number" =~ ^[0-9]+$ ]] || die "--number must be a positive integer"
case "$actor" in
  wrangler | agent) ;;
  *) die "--actor must be wrangler or agent" ;;
esac

if [ "$command" = "start" ]; then
  case "$mode" in
    ci | background | interactive) ;;
    *) die "--mode must be ci, background or interactive" ;;
  esac
else
  case "$result" in
    success | failed | timeout | cancelled | blocked | merged) ;;
    *) die "--result must be success, failed, timeout, cancelled, blocked or merged" ;;
  esac
  if [ "$result" = "merged" ] && [ -z "$merge_sha" ]; then
    warn "--result merged without --merge-sha; the merge SHA will be omitted"
  fi
fi

# Keep a title on one line so the first comment line stays predictable.
title="${title//$'\r'/ }"
title="${title//$'\n'/ }"

actor_name() {
  if [ "$actor" = "wrangler" ]; then
    printf 'Wrangler'
  else
    printf 'Agent'
  fi
}

item_name() {
  if [ "$kind" = "pr" ]; then
    printf 'pull request'
  else
    printf 'issue'
  fi
}

ensure_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  if [ "$forge" = "gh" ]; then
    # gh has no "create only" mode; --force makes the call idempotent and also
    # repairs the colour or description if someone edited the label by hand.
    gh label create "$name" \
      --repo "$repo" \
      --color "${color#\#}" \
      --description "$description" \
      --force >/dev/null 2>&1 ||
      warn "could not create or update label '$name'"
  else
    # tea has no --force and fails when the label already exists. Ignore the
    # error so the call is idempotent; there is no separate update here.
    tea labels create \
      --repo "$repo" \
      --name "$name" \
      --color "$color" \
      --description "$description" >/dev/null 2>&1 || true
  fi
}

ensure_labels() {
  ensure_label "$WORKING_LABEL" "$WORKING_COLOR" "$WORKING_DESCRIPTION"
  ensure_label "$NEEDS_HUMAN_LABEL" "$NEEDS_HUMAN_COLOR" "$NEEDS_HUMAN_DESCRIPTION"
}

add_label() {
  local label="$1"

  if [ "$forge" = "gh" ]; then
    if [ "$kind" = "pr" ]; then
      gh pr edit "$number" --repo "$repo" --add-label "$label" >/dev/null 2>&1 ||
        warn "could not add label '$label'"
    else
      gh issue edit "$number" --repo "$repo" --add-label "$label" >/dev/null 2>&1 ||
        warn "could not add label '$label'"
    fi
  else
    if [ "$kind" = "pr" ]; then
      tea pulls edit "$number" --repo "$repo" --add-labels "$label" >/dev/null 2>&1 ||
        warn "could not add label '$label'"
    else
      tea issues edit "$number" --repo "$repo" --add-labels "$label" >/dev/null 2>&1 ||
        warn "could not add label '$label'"
    fi
  fi
}

remove_label() {
  local label="$1"

  if [ "$forge" = "gh" ]; then
    if [ "$kind" = "pr" ]; then
      gh pr edit "$number" --repo "$repo" --remove-label "$label" >/dev/null 2>&1 ||
        warn "could not remove label '$label'"
    else
      gh issue edit "$number" --repo "$repo" --remove-label "$label" >/dev/null 2>&1 ||
        warn "could not remove label '$label'"
    fi
  else
    if [ "$kind" = "pr" ]; then
      tea pulls edit "$number" --repo "$repo" --remove-labels "$label" >/dev/null 2>&1 ||
        warn "could not remove label '$label'"
    else
      tea issues edit "$number" --repo "$repo" --remove-labels "$label" >/dev/null 2>&1 ||
        warn "could not remove label '$label'"
    fi
  fi
}

post_comment() {
  local body="$1"

  if [ "$forge" = "gh" ]; then
    if [ "$kind" = "pr" ]; then
      gh pr comment "$number" --repo "$repo" --body "$body" >/dev/null
    else
      gh issue comment "$number" --repo "$repo" --body "$body" >/dev/null
    fi
  else
    tea comments add "$number" --repo "$repo" --description "$body" >/dev/null
  fi
}

list_start_comments() {
  if [ "$forge" = "gh" ]; then
    gh api "repos/$repo/issues/$number/comments" --paginate \
      --jq '.[] | select((.body // "") | contains("work started")) | .body'
  else
    if ! command -v jq >/dev/null 2>&1; then
      warn "jq is required to deduplicate start comments on Gitea"
      return 1
    fi
    tea comments list "$number" --repo "$repo" --output json 2>/dev/null |
      jq -r '.[] | select((.body // "") | contains("work started")) | .body'
  fi
}

has_start_comment() {
  local key="$1"
  [ -n "$key" ] || return 1

  local comments
  comments="$(list_start_comments 2>/dev/null)" || return 1
  [ -n "$comments" ] || return 1

  printf '%s\n' "$comments" | grep -Fq -- "$key"
}

build_start_body() {
  local item
  local title_suffix=""
  local metadata

  item="$(item_name)"
  [ -n "$title" ] && title_suffix=": $title"

  metadata="Mode: $mode"
  [ -n "$session" ] && metadata="$metadata · Session: $session"
  [ -n "$run_url" ] && metadata="$metadata · Run: $run_url"

  printf '%s\n%s' \
    "$(actor_name): work started on $item #$number$title_suffix." \
    "$metadata"
}

finish_verb() {
  case "$result" in
    merged)
      if [ -n "$merge_sha" ]; then
        printf 'merged as %s' "$merge_sha"
      else
        printf 'merged'
      fi
      ;;
    blocked)
      if [ "$actor" = "wrangler" ]; then
        printf 'blocked'
      else
        printf 'work blocked'
      fi
      ;;
    timeout)
      if [ "$actor" = "wrangler" ]; then
        printf 'done'
      else
        printf 'work timed out'
      fi
      ;;
    cancelled)
      if [ "$actor" = "wrangler" ]; then
        printf 'done'
      else
        printf 'work cancelled'
      fi
      ;;
    *)
      if [ "$actor" = "wrangler" ]; then
        printf 'done'
      else
        printf 'work finished'
      fi
      ;;
  esac
}

build_finish_body() {
  local item
  local title_suffix=""
  local result_text
  local metadata

  item="$(item_name)"
  [ -n "$title" ] && title_suffix=": $title"

  result_text="$result"
  [ -n "$detail" ] && result_text="$result ($detail)"

  metadata="Result: $result_text"
  [ -n "$session" ] && metadata="$metadata · Session: $session"
  [ -n "$run_url" ] && metadata="$metadata · Run: $run_url"

  printf '%s\n%s' \
    "$(actor_name): $(finish_verb) on $item #$number$title_suffix." \
    "$metadata"
}

if [ "$command" = "start" ]; then
  ensure_labels
  add_label "$WORKING_LABEL"

  dedupe_key="${run_url:-$session}"
  if has_start_comment "$dedupe_key"; then
    warn "a start comment for this run already exists; not posting another"
  else
    post_comment "$(build_start_body)"
  fi
  exit 0
fi

ensure_labels
remove_label "$WORKING_LABEL"
case "$result" in
  failed | timeout | blocked) add_label "$NEEDS_HUMAN_LABEL" ;;
esac
post_comment "$(build_finish_body)"
