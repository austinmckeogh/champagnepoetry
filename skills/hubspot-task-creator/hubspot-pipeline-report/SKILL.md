---
name: hubspot-pipeline-report
description: Pipeline coverage, velocity, weighted forecast, and aging analysis for Monday pipeline review meetings
metadata:
  openclaw:
    emoji: "📈"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN", "QUARTERLY_TARGET"]
---

# HubSpot Pipeline Report

## When to use

Run this skill when asked for a pipeline report, pipeline review, forecast, or coverage analysis. Automatically invoked via cron at 4:00 PM every Friday for the Monday pipeline review meeting.

## Reference Data

### Stage Probabilities (for weighted forecast)

| Stage | Probability |
|-------|------------|
| Lead Identified | 5% |
| Outreach Initiated | 10% |
| Discovery Meeting | 20% |
| Needs Analysis | 40% |
| Proposal/Demo | 60% |
| Negotiation | 80% |

### Stage Order

Lead Identified → Outreach Initiated → Discovery Meeting → Needs Analysis → Proposal/Demo → Negotiation → Closed Won / Closed Lost

### Ideal Coverage Ratio

Pipeline should be 3x–5x the quarterly target for healthy coverage.

## Steps

1. **Fetch all open deals** using HubSpot deals tool with properties:
   - `dealname`, `dealstage`, `pipeline`, `amount`, `hubspot_owner_id`, `closedate`, `createdate`, `hs_lastmodifieddate`
   - Use `propertiesWithHistory=dealstage` to get stage history

2. **Fetch all owners** and build owner ID → name map.

3. **Read QUARTERLY_TARGET** from environment (default to 500000 if not set).

4. **Pipeline by Stage**: Group deals by stage. For each stage, calculate:
   - Number of deals
   - Total dollar amount
   - Average deal size

5. **Coverage Ratio**: Calculate total open pipeline / quarterly target. Flag:
   - 🟢 3x+ coverage: healthy
   - 🟡 2x-3x coverage: needs attention
   - 🔴 Below 2x: critical

6. **Velocity by Stage**: For each stage, calculate average days deals have spent in that stage using stage history. Compare to stage time limits (Lead 3d, Outreach 7d, Discovery 14d, Needs Analysis 14d, Proposal 21d, Negotiation 30d).

7. **Weighted Forecast**: For each open deal, calculate `amount * probability` using the stage probability table. Sum for total weighted forecast.

8. **Aging Analysis**: Group open deals by age (from `createdate`):
   - 0–30 days
   - 31–60 days
   - 61–90 days
   - 90+ days
   Show count and total dollar amount per bucket.

9. **Expected Closes**: Find open deals with `closedate` in:
   - This month (remaining)
   - This quarter (remaining)
   Show deal name, stage, amount, and close date.

10. **Generate talking points** for the Monday pipeline review meeting based on the data:
    - Highlight top risks (stale deals, low coverage, slow stages)
    - Highlight wins (deals advancing, new pipeline created)
    - Recommend actions

## Output Format

Format as Slack blocks:

```
*📈 Pipeline Report*
_{date} — Monday Review Prep_

*Pipeline by Stage*
━━━━━━━━━━━━━━━━━━━━
| Stage | Deals | Amount | Avg Size |
|-------|-------|--------|----------|
| Lead Identified | {n} | ${amt} | ${avg} |
| Outreach Initiated | {n} | ${amt} | ${avg} |
| Discovery Meeting | {n} | ${amt} | ${avg} |
| Needs Analysis | {n} | ${amt} | ${avg} |
| Proposal/Demo | {n} | ${amt} | ${avg} |
| Negotiation | {n} | ${amt} | ${avg} |
| *Total* | *{n}* | *${amt}* | *${avg}* |

*Coverage Ratio*
━━━━━━━━━━━━━━━━━━━━
Open Pipeline: ${total} | Quarterly Target: ${target}
Coverage: {ratio}x {🟢/🟡/🔴}

*Velocity by Stage*
━━━━━━━━━━━━━━━━━━━━
| Stage | Avg Days | Limit | Status |
|-------|----------|-------|--------|
| {stage} | {days}d | {limit}d | 🟢/🟡/🔴 |

*Weighted Forecast*
━━━━━━━━━━━━━━━━━━━━
| Stage | Pipeline | Probability | Weighted |
|-------|----------|-------------|----------|
| {stage} | ${amt} | {pct}% | ${weighted} |
| *Total* | *${total}* | | *${weighted total}* |

*Aging Analysis*
━━━━━━━━━━━━━━━━━━━━
| Age Bucket | Deals | Amount |
|------------|-------|--------|
| 0–30 days | {n} | ${amt} |
| 31–60 days | {n} | ${amt} |
| 61–90 days | {n} | ${amt} |
| 90+ days | {n} | ${amt} |

*Expected Closes This Month*
━━━━━━━━━━━━━━━━━━━━
| Deal | Stage | Amount | Close Date |
|------|-------|--------|------------|
| {name} | {stage} | ${amt} | {date} |

*Expected Closes This Quarter*
━━━━━━━━━━━━━━━━━━━━
| Deal | Stage | Amount | Close Date |
|------|-------|--------|------------|
| {name} | {stage} | ${amt} | {date} |

*🎯 Talking Points for Monday Review*
━━━━━━━━━━━━━━━━━━━━
1. {risk or highlight}
2. {risk or highlight}
3. {recommended action}
```
