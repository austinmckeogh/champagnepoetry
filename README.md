# Sensor Bio Sales CRM Automation

OpenClaw-powered AI agent that monitors HubSpot CRM 24/7, enforces rep accountability, and reports via Slack.

## Skills

| Skill | Description |
|-------|-------------|
| `/hubspot-hygiene` | Stale deals, overdue tasks, missing activity, missing fields |
| `/hubspot-scorecard` | 12 EOS metrics with traffic-light formatting |
| `/hubspot-deal-query` | Natural language deal lookups |
| `/hubspot-rep-briefing` | Per-rep daily briefing: tasks, deals, violations |
| `/hubspot-task-creator` | Auto-create follow-ups on stage moves + escalations |
| `/hubspot-activity-logger` | Quick activity logging via Slack |
| `/hubspot-pipeline-report` | Pipeline coverage, velocity, weighted forecast |

## Setup

### 1. Install the skill set

```bash
openclaw skills install <path-to-this-repo>
```

### 2. Configure

Copy the example config and set your HubSpot token:

```bash
cp openclaw-config.example.json ~/.openclaw/openclaw-config.json
```

Set your HubSpot access token:

```bash
# Add to ~/.openclaw/.env
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx
QUARTERLY_TARGET=500000
```

### 3. Required HubSpot Scopes

Your private app token needs these scopes:

- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `crm.objects.contacts.read`
- `crm.objects.owners.read`
- `sales-email-read`

### 4. Register Cron Jobs

```bash
bash cron/register-jobs.sh
```

### 5. Verify

```bash
# Test a skill on-demand
openclaw run "Run /hubspot-hygiene"

# Test a cron job
openclaw cron run <jobId>

# Health check
openclaw doctor
```

## Cron Schedule

| Job | Schedule | Skill | Destination |
|-----|----------|-------|-------------|
| Morning Hygiene | 8:30 AM daily | `/hubspot-hygiene` | #sales-ops |
| Monday Scorecard | 8:00 AM Monday | `/hubspot-scorecard` | #sales-scorecard |
| Daily Rep Briefing | 8:00 AM Mon-Fri | `/hubspot-rep-briefing` | DM per rep |
| Stale Deal Escalation | 9:00 AM Mon-Fri | `/hubspot-task-creator` | Austin DM |
| Friday Pipeline Review | 4:00 PM Friday | `/hubspot-pipeline-report` | #sales-pipeline |
| EOD Activity Check | 5:00 PM Mon-Fri | `/hubspot-hygiene` (activity-only) | #sales-ops |

All times in America/Chicago. Configurable in `openclaw-config.example.json`.

## Security

- Gateway bound to loopback only (CVE-2026-25253 mitigation)
- HubSpot token stored as SecretRef, never hardcoded
- `.env` is gitignored
- Only `kwall1/hubspot` used as external dependency (official skill)
