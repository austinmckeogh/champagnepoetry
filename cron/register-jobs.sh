#!/usr/bin/env bash
# Register all Sensor Bio Sales CRM cron jobs with OpenClaw
# Usage: bash cron/register-jobs.sh
# Timezone is configurable — defaults to America/Chicago

set -euo pipefail

TZ="${OPENCLAW_TZ:-America/Chicago}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FLAGS="--session isolated --tz $TZ --pre-run \"bash $SCRIPT_DIR/refresh-token.sh\""

echo "Registering Sensor Bio Sales CRM cron jobs (timezone: $TZ)..."
echo "Token refresh will run before each job."
echo ""

# Morning Hygiene — 8:30 AM daily
openclaw cron add \
  --name "morning-hygiene" \
  --schedule "30 8 * * *" \
  --skill "/hubspot-hygiene" \
  --channel "#sales-ops" \
  $FLAGS
echo "✓ morning-hygiene (8:30 AM daily → #sales-ops)"

# Monday Scorecard — 8:00 AM Monday
openclaw cron add \
  --name "monday-scorecard" \
  --schedule "0 8 * * 1" \
  --skill "/hubspot-scorecard" \
  --channel "#sales-scorecard" \
  $FLAGS
echo "✓ monday-scorecard (8:00 AM Monday → #sales-scorecard)"

# Daily Rep Briefing — 8:00 AM Mon-Fri, DM per rep
openclaw cron add \
  --name "daily-rep-briefing" \
  --schedule "0 8 * * 1-5" \
  --skill "/hubspot-rep-briefing" \
  --dm-per-rep \
  $FLAGS
echo "✓ daily-rep-briefing (8:00 AM Mon-Fri → DM per rep)"

# Stale Deal Escalation — 9:00 AM Mon-Fri
openclaw cron add \
  --name "stale-deal-escalation" \
  --schedule "0 9 * * 1-5" \
  --skill "/hubspot-task-creator" \
  --prompt "escalate stale deals" \
  --dm "austin" \
  $FLAGS
echo "✓ stale-deal-escalation (9:00 AM Mon-Fri → Austin DM)"

# Friday Pipeline Review — 4:00 PM Friday
openclaw cron add \
  --name "friday-pipeline-review" \
  --schedule "0 16 * * 5" \
  --skill "/hubspot-pipeline-report" \
  --channel "#sales-pipeline" \
  $FLAGS
echo "✓ friday-pipeline-review (4:00 PM Friday → #sales-pipeline)"

# EOD Activity Check — 5:00 PM Mon-Fri
openclaw cron add \
  --name "eod-activity-check" \
  --schedule "0 17 * * 1-5" \
  --skill "/hubspot-hygiene" \
  --prompt "activity-only" \
  --channel "#sales-ops" \
  $FLAGS
echo "✓ eod-activity-check (5:00 PM Mon-Fri → #sales-ops)"

# Token Refresh — every 25 minutes to keep OAuth token alive
openclaw cron add \
  --name "token-refresh" \
  --schedule "*/25 * * * *" \
  --exec "bash $SCRIPT_DIR/refresh-token.sh" \
  --tz $TZ
echo "✓ token-refresh (every 25 min — keeps OAuth token alive)"

echo ""
echo "All 7 jobs registered. Verify with: openclaw cron list"
