---
name: hubspot-rep-briefing
description: Per-rep daily briefing with tasks, top deals, hygiene violations, and recent stage changes
metadata:
  openclaw:
    emoji: "📬"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN"]
---

# HubSpot Rep Daily Briefing

## When to use

Run this skill to generate a daily briefing for each sales rep (or a specific rep if named). Automatically invoked via cron at 8:00 AM Monday–Friday, delivering a DM to each rep.

If the user specifies a rep name (e.g., "briefing for John"), generate only that rep's briefing.

## Reference Data

### Stage Time Limits (for hygiene violations)

| Stage | Warning (days) |
|-------|---------------|
| Lead Identified | 3 |
| Outreach Initiated | 7 |
| Discovery Meeting | 14 |
| Needs Analysis | 14 |
| Proposal/Demo | 21 |
| Negotiation | 30 |

### Required Fields by Stage

| Stage | Required Fields |
|-------|----------------|
| Lead Identified | `dealname`, `amount` |
| Outreach Initiated | `dealname`, `amount` |
| Discovery Meeting+ | + `closedate` |
| Proposal/Demo+ | + `num_decision_makers` |

## Steps

1. **Fetch all owners** using HubSpot owners tool. Build owner ID → name map. If a specific rep was named, filter to only that rep.

2. **For each rep**, gather the following data:

3. **Today's Tasks**: Search tasks where `hubspot_owner_id` matches the rep, `hs_task_due_date` = today, and `status != COMPLETED`. List task subject and associated deal.

4. **Overdue Tasks**: Search tasks where `hubspot_owner_id` matches the rep, `hs_task_due_date < today`, and `status != COMPLETED`. List task subject, deal, and how many days overdue.

5. **Top 5 Open Deals**: Fetch the rep's open deals sorted by `amount` descending. Take the top 5. Include deal name, stage, amount, close date, and days-in-stage.

6. **Hygiene Violations**: For each of the rep's open deals:
   - Check if the deal is stale (exceeds stage time limit)
   - Check if the deal is missing required fields for its stage
   - Check if the deal has no engagement in the last 7 days
   - List each violation

7. **Stage Changes (Last 24h)**: Check `dealstage` property history for the rep's deals. Find any deals where the stage changed in the last 24 hours. Show the old stage → new stage transition.

## Output Format

Generate one Slack message per rep, formatted as blocks:

```
*📬 Daily Briefing — {Rep Name}*
_{date}_

*📋 Today's Tasks ({count})*
• {task subject} — _{deal name}_
• {task subject} — _{deal name}_

*⏰ Overdue Tasks ({count})*
• {task subject} — _{deal name}_ ({days}d overdue)
• {task subject} — _{deal name}_ ({days}d overdue)

*💰 Top Deals*
| Deal | Stage | Amount | Close Date | Days in Stage |
|------|-------|--------|------------|---------------|
| {name} | {stage} | ${amt} | {date} | {days}d |
| ... | ... | ... | ... | ... |

*⚠️ Hygiene Violations ({count})*
• 🚨 *{deal name}* — Stale in {stage} ({days}d, limit {limit}d)
• 📭 *{deal name}* — No activity in 7+ days
• 📋 *{deal name}* — Missing: {field1}, {field2}

*🔄 Stage Changes (Last 24h)*
• *{deal name}*: {old stage} → {new stage}

━━━━━━━━━━━━━━━━━━━━
_Have a great day! 🎯_
```

If a section has no items, show:
```
*📋 Today's Tasks (0)*
_No tasks due today — nice!_
```

If there are no hygiene violations:
```
*⚠️ Hygiene Violations (0)*
_All clear! ✅_
```
