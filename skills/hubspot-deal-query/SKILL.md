---
name: hubspot-deal-query
description: Natural language deal lookups — search and filter deals using plain English
metadata:
  openclaw:
    emoji: "🔎"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN"]
---

# HubSpot Deal Query

## When to use

Run this skill when the user asks about deals in natural language. Examples:
- "What deals are in negotiation?"
- "Show me stale deals"
- "Deals over $50k"
- "What's John working on?"
- "Deals closing this month"
- "Show me the pipeline"
- "Any deals stuck in discovery?"

## Reference Data

### Deal Stages

| Stage | Internal Name |
|-------|--------------|
| Lead Identified | leadidentified |
| Outreach Initiated | outreachinitiated |
| Discovery Meeting | discoverymeeting |
| Needs Analysis | needsanalysis |
| Proposal/Demo | proposaldemo |
| Negotiation | negotiation |
| Closed Won | closedwon |
| Closed Lost | closedlost |

### Stage Time Limits (for "stale" queries)

| Stage | Limit (days) |
|-------|-------------|
| Lead Identified | 3 |
| Outreach Initiated | 7 |
| Discovery Meeting | 14 |
| Needs Analysis | 14 |
| Proposal/Demo | 21 |
| Negotiation | 30 |

## Steps

1. **Parse the user's query** to determine the intent:
   - **Stage filter**: "in negotiation", "discovery deals", "proposal stage" → filter by `dealstage`
   - **Amount filter**: "over $50k", "deals above 100k", "big deals" (>$50k) → filter by `amount`
   - **Owner filter**: "John's deals", "what's Sarah working on" → match owner name, filter by `hubspot_owner_id`
   - **Date filter**: "closing this month", "closing in Q2" → filter by `closedate`
   - **Stale filter**: "stale deals", "stuck deals" → find deals exceeding stage time limits
   - **General**: "show pipeline", "all open deals" → show all non-closed deals

2. **Fetch owners** using HubSpot owners tool. Build owner ID → name map.

3. **Fetch deals** using HubSpot deals tool with properties:
   - `dealname`, `dealstage`, `pipeline`, `amount`, `hubspot_owner_id`, `closedate`, `createdate`, `hs_lastmodifieddate`
   - Use `propertiesWithHistory=dealstage` to calculate days-in-stage
   - Apply appropriate filters based on parsed intent

4. **Calculate days-in-stage** for each deal using the most recent `dealstage` history entry.

5. **Sort results** by amount descending (default), or by days-in-stage for stale queries.

6. **Format the output** as a deal table.

## Output Format

Format as Slack blocks:

```
*🔎 Deal Query Results*
_"{original query}"_ — {count} deals found

| Deal | Stage | Amount | Owner | Close Date | Days in Stage |
|------|-------|--------|-------|------------|---------------|
| {name} | {stage} | ${amount} | {owner} | {date} | {days}d |
| ... | ... | ... | ... | ... | ... |

*Totals: {count} deals | ${total amount} pipeline*
```

If no deals match:

```
*🔎 Deal Query Results*
_"{original query}"_

No deals found matching your query.
```

For stale deal queries, add the stale indicator:

```
| Deal | Stage | Amount | Owner | Days in Stage | Limit | Status |
|------|-------|--------|-------|---------------|-------|--------|
| {name} | {stage} | ${amount} | {owner} | {days}d | {limit}d | 🚨/⚠️ |
```
