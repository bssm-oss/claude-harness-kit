#!/bin/bash
# Lightweight post-push CI check hook
# Triggered by PostToolUse on Bash commands containing "git push"
# Returns latest run status as feedback to Claude
#
# Setup in ~/.claude/settings.json:
# {
#   "hooks": {
#     "PostToolUse": [{
#       "matcher": "Bash",
#       "hooks": [{
#         "type": "command",
#         "command": "if echo \"$CC_BASH_COMMAND\" | grep -q 'git push'; then ~/.claude/hooks/ci-push-check.sh; fi"
#       }]
#     }]
#   }
# }

if ! git rev-parse --git-dir >/dev/null 2>&1; then exit 0; fi

remote_url=$(git remote get-url origin 2>/dev/null)
if [ -z "$remote_url" ]; then exit 0; fi

# Parse owner/repo from GitHub URL
repo_path=$(echo "$remote_url" | sed -E 's|.*github\.com[:/](.+)(\.git)?$|\1|' | sed 's|\.git$||')
if [ -z "$repo_path" ]; then exit 0; fi

# Only watch main/master/develop branches
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ "$branch" != "main" ] && [ "$branch" != "master" ] && [ "$branch" != "develop" ]; then
  exit 0
fi

# Check latest run on this branch
run_info=$(gh api "/repos/${repo_path}/actions/runs?per_page=1&branch=${branch}" \
  --jq '.workflow_runs[0] | "\(.name)|\(.status)|\(.conclusion // "pending")|\(.html_url)|\(.id)"' 2>/dev/null)

if [ -z "$run_info" ]; then exit 0; fi

IFS='|' read -r name status conclusion url run_id <<< "$run_info"

if [ "$status" = "queued" ] || [ "$status" = "in_progress" ]; then
  echo "🏃 CI: ${name} is ${status} on ${branch} — ${url}"
  echo "ACTION: spawn background ci-watch agent to monitor run #${run_id}"
elif [ "$status" = "completed" ] && [ "$conclusion" = "failure" ]; then
  echo "❌ CI FAILED: ${name} on ${branch} — ${url}"
  echo "ACTION: run /ci-watch to diagnose and fix"
elif [ "$status" = "completed" ] && [ "$conclusion" = "cancelled" ]; then
  echo "⚠️ CI CANCELLED: ${name} on ${branch} — ${url}"
  echo "ACTION: run /ci-watch to diagnose"
elif [ "$status" = "completed" ] && [ "$conclusion" = "success" ]; then
  echo "✅ CI passed: ${name} on ${branch}"
fi
