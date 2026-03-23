---
name: hubspot-hygiene
description: Audit open deals for stale stages, overdue tasks, missing activity, and missing required fields
metadata:
  openclaw:
    emoji: "🔍"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN"]
---

# HubSpot Pipeline Hygiene Audit

## When to use

Run this skill when asked to check pipeline hygiene, find stale deals, identify overdue tasks, or audit missing fields. Also invoked automatically via cron at 8:30 AM daily and 5:00 PM (activity-only mode).

If the user says "activity-only" or "activity check", run ONLY the Missing Activity Check (Step 3) and skip the other checks.

## Reference Data

### Stage Time Limits (days)

| Stage | Warning (1x) | Critical (2x) |
|-------|-------------|----------------|
| Lead Identified | 3 | 6 |
| Outreach Initiated | 7 | 14 |
| Discovery Meeting | 14 | 28 |
| Needs Analysis | 14 | 28 |
| Proposal/Demo | 21 | 42 |
| Negotiation | 30 | 60 |

### Required Fields by Stage

| Stage | Required Fields |
|-------|----------------|
| Lead Identified | `dealname`, `amount` |
| Outreach Initiated | `dealname`, `amount` |
| Discovery Meeting | `dealname`, `amount`, `closedate` |
| Needs Analysis | `dealname`, `amount`, `closedate` |
| Proposal/Demo | `dealname`, `amount`, `closedate`, `num_decision_makers` |
| Negotiation | `dealname`, `amount`, `closedate`, `num_decision_makers` |

## Steps

1. **Fetch all owners** using the HubSpot owners tool. Build a map of owner ID → owner name.

2. **Fetch all open deals** using the HubSpot deals tool with these properties:
   - `dealname`, `dealstage`, `pipeline`, `amount`, `hubspot_owner_id`, `closedate`, `createdate`, `hs_lastmodifieddate`, `num_decision_makers`
   - Use `propertiesWithHistory=dealstage` to get stage change history
   - Filter to exclude Closed Won and Closed Lost deals

3. **Stale Deal Check**: For each open deal:
   - Find the most recent `dealstage` history entry to determine when the deal entered its current stage
   - Calculate days in current stage = (today - stage entry date)
   - Compare against the Warning and Critical limits from the reference table
   - Flag deals at 1x limit as ⚠️ WARNING, at 2x limit as 🚨 CRITICAL

4. **Overdue Task Check**: Search for tasks using the HubSpot tasks/engagements tool:
   - Filter: `status != COMPLETED` AND `hs_task_due_date < today`
   - Include the associated deal and owner for each task

5. **Missing Activity Check**: For each open deal:
   - Check if any engagement (call, email, meeting, or note) exists associated with the deal in the last 7 days
   - Flag deals with no recent activity as 📭 NO RECENT ACTIVITY

6. **Missing Field Check**: For each open deal:
   - Look up the required fields for the deal's current stage from the reference table
   - Check if any required field is empty/null
   - Flag missing fields as 📋 MISSING FIELDS with the list of missing field names

7. **Format the output** grouped by rep, sorted by severity (CRITICAL first, then WARNING, then others).

## Output Format

Format as Slack blocks:

```
*🔍 Pipeline Hygiene Report*
_{date}_

*Rep: {owner name}*
━━━━━━━━━━━━━━━━━━━━

🚨 *CRITICAL — Stale Deal*
*{deal name}* | {stage} | ${amount}
Stuck for {days}d (limit: {limit}d)

⚠️ *WARNING — Stale Deal*
*{deal name}* | {stage} | ${amount}
In stage for {days}d (limit: {limit}d)

⏰ *Overdue Task*
Task: {task subject}
Deal: *{deal name}* | Due: {due date}

📭 *No Recent Activity (7d)*
*{deal name}* | {stage} | ${amount}
Last activity: {date or "None"}

📋 *Missing Fields*
*{deal name}* | {stage}
Missing: {field1}, {field2}

━━━━━━━━━━━━━━━━━━━━
*Summary*
🚨 Critical: {count} | ⚠️ Warning: {count} | ⏰ Overdue Tasks: {count} | 📭 No Activity: {count} | 📋 Missing Fields: {count}
Total open deals audited: {count}
```

If there are no issues found, output:

```
*🔍 Pipeline Hygiene Report*
_{date}_

✅ All clear! No hygiene issues found across {count} open deals.
```
