---
name: hubspot-pipeline-automation
description: Detect deal stage changes and automatically create rep tasks and (optionally) send emails. Runs on a schedule to catch stage transitions and trigger the right follow-up actions.
metadata:
  openclaw:
    emoji: "⚙️"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN"]
---

# HubSpot Pipeline Automation

## When to use

Triggered on a schedule (every 30 minutes) to detect deal stage changes and fire automated actions:
- Create rep tasks for each stage entered
- (Stubbed) Enroll rep in email sequence for the stage

If called with "dry-run", log what would happen but don't create anything.

## Reference Data

### Stage Actions

| Stage | Task Title | Due (days) | Email Stub |
|-------|-----------|------------|------------|
| Lead Identified | Initiate outreach — call or email {dealname} | +3 | EMAIL_LEAD_IDENTIFIED |
| Outreach Initiated | Schedule discovery call with {dealname} | +7 | EMAIL_OUTREACH_INITIATED |
| Discovery Meeting | Send prep materials and confirm meeting — {dealname} | +2 | EMAIL_DISCOVERY_MEETING |
| Needs Analysis | Build and send proposal for {dealname} | +14 | EMAIL_NEEDS_ANALYSIS |
| Proposal/Demo | Follow up on proposal sent to {dealname} | +5 | EMAIL_PROPOSAL_DEMO |
| Negotiation | Push to close — resolve blockers for {dealname} | +7 | EMAIL_NEGOTIATION |

### Stage ID Map (HubSpot internal names)
HubSpot stage IDs vary by portal. In Step 1, fetch the pipeline to resolve stage labels → IDs dynamically. Match stage labels case-insensitively against the table above.

### Email Stubs
Emails are NOT yet enabled. The `EMAIL_*` stubs are placeholders. When email templates are ready:
1. Add template IDs to the Email Stubs section below
2. Set `EMAIL_ENABLED=true` in the env
3. Use the HubSpot Sequences enrollment API to enroll the rep

Email stubs (fill in when ready):
- EMAIL_LEAD_IDENTIFIED: null
- EMAIL_OUTREACH_INITIATED: null
- EMAIL_DISCOVERY_MEETING: null
- EMAIL_NEEDS_ANALYSIS: null
- EMAIL_PROPOSAL_DEMO: null
- EMAIL_NEGOTIATION: null

### Lookback Window
Check for stage changes in the last **35 minutes** (slightly over the 30-min cron interval to avoid gaps).

## Steps

1. **Fetch pipeline stages**: Call `GET /crm/v3/pipelines/deals` to get all pipelines and build a map of stage ID → stage label. Identify which pipeline to use (default: first pipeline, or the one named "Sales Pipeline" if present).

2. **Fetch recently modified open deals** with `propertiesWithHistory=dealstage`:
   ```bash
   curl -s -X POST \
     -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "filterGroups": [{"filters": [
         {"propertyName": "dealstage", "operator": "NEQ", "value": "closedwon"},
         {"propertyName": "dealstage", "operator": "NEQ", "value": "closedlost"},
         {"propertyName": "hs_lastmodifieddate", "operator": "GTE", "value": "<now_minus_35min_ms>"}
       ]}],
       "properties": ["dealname", "dealstage", "hubspot_owner_id", "amount"],
       "propertiesWithHistory": ["dealstage"],
       "limit": 100
     }' \
     "https://api.hubapi.com/crm/v3/objects/deals/search"
   ```

3. **Detect stage transitions**: For each deal, look at the `dealstage` history array. Find entries where `timestamp` falls within the lookback window. That means the deal **entered** that stage recently. Extract:
   - `new_stage_id` = the history entry's `value`
   - `new_stage_label` = look up in the stage map from Step 1
   - `transition_time` = the history entry's `timestamp`
   - `owner_id` = `hubspot_owner_id`

4. **Check for existing automation task**: Before creating a task, search for existing tasks associated with the deal that contain the stage label in the subject. Use:
   ```bash
   curl -s -X POST \
     -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"filterGroups": [{"filters": [
       {"propertyName": "associations.deal", "operator": "EQ", "value": "<dealId>"},
       {"propertyName": "hs_task_subject", "operator": "CONTAINS_TOKEN", "value": "<stage_keyword>"},
       {"propertyName": "hs_task_status", "operator": "NEQ", "value": "COMPLETED"}
     ]}], "limit": 5}' \
     "https://api.hubapi.com/crm/v3/objects/tasks/search"
   ```
   If a matching open task already exists, skip creation (idempotency guard).

5. **Create the task**: Look up the stage in the Stage Actions table. Substitute `{dealname}` with the actual deal name. Calculate due date as `today + due_days`. Create the task:
   ```bash
   curl -s -X POST \
     -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "properties": {
         "hs_task_subject": "<task title with dealname>",
         "hs_task_status": "NOT_STARTED",
         "hs_task_type": "TODO",
         "hs_task_due_date": "<due_date_ms>",
         "hubspot_owner_id": "<owner_id>",
         "hs_task_body": "Auto-created by Pipeline Automation | Stage: <stage_label> | Deal entered stage: <transition_time>"
       },
       "associations": [{"to": {"id": "<dealId>"}, "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 216}]}]
     }' \
     "https://api.hubapi.com/crm/v3/objects/tasks"
   ```

6. **Email stub (skip for now)**: If `EMAIL_ENABLED=true` and a template ID exists for this stage, enroll the rep using the Sequences API. Otherwise, skip silently.

7. **Output a summary**:
   - If transitions were found and tasks created: list each deal, stage, task title, due date
   - If no transitions found: output `✅ No stage changes detected in the last 35 minutes.`
   - If dry-run: prefix each action with `[DRY RUN]`

## Output Format

```
⚙️ Pipeline Automation Run — {datetime}

🔄 Stage Transitions Detected: {count}

📋 Tasks Created:
• {dealname} → entered {stage}
  Task: "{task title}"
  Assigned to: {rep name} | Due: {due date}

(repeat per transition)

✉️ Emails: disabled (templates not yet configured)

━━━━━━━━━━━━━━━━━━━━
{count} task(s) created | {count} skipped (already existed)
```
