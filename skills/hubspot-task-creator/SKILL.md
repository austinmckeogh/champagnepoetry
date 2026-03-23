---
name: hubspot-task-creator
description: Auto-create follow-up tasks on deal stage moves and escalation tasks for stale deals
metadata:
  openclaw:
    emoji: "✏️"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN"]
---

# HubSpot Task Creator

## When to use

Run this skill to auto-create follow-up tasks when deals change stage, or to create escalation tasks for stale deals. Automatically invoked via cron at 9:00 AM Monday–Friday for stale deal escalation.

Two modes:
- **Stage-move follow-ups**: Triggered by "create follow-ups" or cron — checks recent stage changes and creates appropriate tasks
- **Stale escalation**: Triggered by "escalate stale" or cron — creates high-priority escalation tasks for critically stale deals

If the user doesn't specify a mode, run both.

## Reference Data

### Follow-up Tasks by Stage

| New Stage | Task Subject | Due (days from now) |
|-----------|-------------|---------------------|
| Outreach Initiated | Send initial outreach | +1 |
| Discovery Meeting | Prepare discovery questions | +2 |
| Needs Analysis | Document needs and decision criteria | +3 |
| Proposal/Demo | Send proposal | +5 |
| Negotiation | Schedule negotiation call | +2 |

### Stage Time Limits (for escalation)

| Stage | Critical Threshold (2x limit) |
|-------|------------------------------|
| Lead Identified | 6 days |
| Outreach Initiated | 14 days |
| Discovery Meeting | 28 days |
| Needs Analysis | 28 days |
| Proposal/Demo | 42 days |
| Negotiation | 60 days |

## Steps

### Stage-Move Follow-ups

1. **Fetch all open deals** with `propertiesWithHistory=dealstage` to get stage change history.

2. **Identify recent stage changes**: Find deals where the `dealstage` changed in the last 4 hours (or 24 hours if running from cron).

3. **For each stage-changed deal**:
   a. Look up the appropriate follow-up task from the reference table based on the new stage
   b. **Idempotency check**: Search existing tasks associated with this deal. If a task with the same subject already exists and is not completed, skip creation.
   c. If no duplicate exists, create the task using the HubSpot tasks tool:
      - Subject: from the reference table
      - Due date: today + the offset from the reference table
      - Owner: same as the deal owner
      - Priority: MEDIUM
      - Associate the task with the deal

4. **Report created tasks** back with deal name, task subject, and due date.

### Stale Deal Escalation

5. **Fetch all open deals** with `propertiesWithHistory=dealstage`.

6. **Calculate days-in-stage** for each deal using the most recent stage history entry.

7. **Identify critically stale deals**: Deals where days-in-stage exceeds the 2x critical threshold from the reference table.

8. **For each critically stale deal**:
   a. Build escalation task subject: `STALE: {deal name} stuck in {stage} for {days}d`
   b. **Idempotency check**: Search existing tasks associated with this deal for a task with subject starting with "STALE:". If one exists and is not completed, skip creation.
   c. If no duplicate exists, create the task:
      - Subject: the escalation subject
      - Due date: today
      - Owner: deal owner
      - Priority: HIGH
      - Associate the task with the deal

9. **Report created escalation tasks** back.

## Output Format

Format as Slack blocks:

```
*✏️ Task Creator Report*
_{date}_

*📋 Stage-Move Follow-ups Created ({count})*
• *{deal name}* → "{task subject}" (due {due date})
  Owner: {rep name} | New stage: {stage}
• *{deal name}* → "{task subject}" (due {due date})
  Owner: {rep name} | New stage: {stage}

*Skipped ({count})*: {count} deals already had matching tasks

*🚨 Escalation Tasks Created ({count})*
• *{deal name}* — Stuck in {stage} for {days}d (limit: {limit}d)
  Task: "{task subject}" assigned to {rep name}

━━━━━━━━━━━━━━━━━━━━
*Total: {follow-up count} follow-ups + {escalation count} escalations created*
```

If no tasks were created:

```
*✏️ Task Creator Report*
_{date}_

✅ No new tasks needed — all follow-ups are current and no deals are critically stale.
```
