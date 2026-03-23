---
name: hubspot-scorecard
description: Weekly EOS scorecard with 12 sales metrics, goals comparison, and traffic-light formatting
metadata:
  openclaw:
    emoji: "📊"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN"]
---

# HubSpot Weekly EOS Scorecard

## When to use

Run this skill when asked for the weekly scorecard, EOS metrics, sales metrics, or team performance summary. Automatically invoked via cron at 8:00 AM every Monday.

## Reference Data

### Metric Goals (per rep unless noted)

| # | Metric | Goal | Type |
|---|--------|------|------|
| 1 | Outbound Touches | 100/rep | Per rep |
| 2 | New Conversations | 15/rep | Per rep |
| 3 | Discovery Meetings Set | 5/rep | Per rep |
| 4 | Discovery Meetings Held | 4/rep | Per rep |
| 5 | Proposals Sent | 2/rep | Per rep |
| 6 | Pipeline Created ($) | Use QUARTERLY_TARGET/13 as weekly goal | Team |
| 7 | Pipeline Velocity (avg days in stage) | < stage max (see hygiene limits) | Team |
| 8 | Stale Deal Count | 0 | Team |
| 9 | Task Completion % | > 90% | Per rep |
| 10 | Activity Log Rate | > 95% | Per rep |
| 11 | Closed Won ($) | Use QUARTERLY_TARGET/13 as weekly goal | Team |
| 12 | Win Rate | > 25% | Team |

### Traffic Light Thresholds

- 🟢 Green: At or above goal
- 🟡 Yellow: Between 80% and 100% of goal
- 🔴 Red: Below 80% of goal
- For "lower is better" metrics (Stale Deal Count, Pipeline Velocity): invert the logic

### Week Boundaries

The current week runs Monday 00:00 to Sunday 23:59 in the configured timezone. If today is Monday, report on the **previous** week (Monday-Sunday).

## Steps

1. **Determine the reporting week**: Calculate the Monday-Sunday date range. If today is Monday, use the previous Monday through previous Sunday.

2. **Fetch all owners** using HubSpot owners tool. Build owner ID → name map.

3. **Metric 1 — Outbound Touches**: Search for engagements of type `EMAIL` and `CALL` created within the reporting week. Count per rep.

4. **Metric 2 — New Conversations**: Search for contacts where `hs_lifecyclestage_lead_date` falls within the reporting week. Count per rep (by owner).

5. **Metric 3 — Discovery Meetings Set**: Search for engagements of type `MEETING` created within the reporting week that are associated with deals in Discovery Meeting stage. Count per rep.

6. **Metric 4 — Discovery Meetings Held**: Search for meetings with `hs_meeting_outcome = COMPLETED` within the reporting week. Count per rep.

7. **Metric 5 — Proposals Sent**: Search for deals where `dealstage` history shows entry into "Proposal/Demo" stage during the reporting week. Count per rep.

8. **Metric 6 — Pipeline Created ($)**: Sum the `amount` of deals where `createdate` falls within the reporting week. Team total.

9. **Metric 7 — Pipeline Velocity**: For all currently open deals, calculate average days-in-current-stage using `dealstage` history. Team average.

10. **Metric 8 — Stale Deal Count**: Count open deals exceeding stage time limits (use limits from hubspot-hygiene reference data: Lead 3d, Outreach 7d, Discovery 14d, Needs Analysis 14d, Proposal 21d, Negotiation 30d).

11. **Metric 9 — Task Completion %**: Search tasks with due date in reporting week. Calculate completed / total due. Per rep.

12. **Metric 10 — Activity Log Rate**: For all open deals, check how many had at least one engagement this week. Calculate (deals with activity / total open deals). Per rep.

13. **Metric 11 — Closed Won ($)**: Sum the `amount` of deals moved to "Closed Won" during the reporting week (check `dealstage` history). Team total.

14. **Metric 12 — Win Rate**: Closed Won count / (Closed Won count + Closed Lost count) during the reporting week. Team total.

15. **Apply traffic lights** to each metric based on the thresholds defined above.

## Output Format

Format as Slack blocks:

```
*📊 Weekly EOS Scorecard*
_Week of {Monday date} – {Sunday date}_

*Team Metrics*
━━━━━━━━━━━━━━━━━━━━
| # | Metric | Actual | Goal | Status |
|---|--------|--------|------|--------|
| 6 | Pipeline Created | ${actual} | ${goal} | 🟢/🟡/🔴 |
| 7 | Avg Pipeline Velocity | {days}d | < limits | 🟢/🟡/🔴 |
| 8 | Stale Deals | {count} | 0 | 🟢/🟡/🔴 |
| 11 | Closed Won | ${actual} | ${goal} | 🟢/🟡/🔴 |
| 12 | Win Rate | {pct}% | >25% | 🟢/🟡/🔴 |

*Per-Rep Metrics*
━━━━━━━━━━━━━━━━━━━━
*{Rep Name}*
| # | Metric | Actual | Goal | Status |
|---|--------|--------|------|--------|
| 1 | Outbound Touches | {count} | 100 | 🟢/🟡/🔴 |
| 2 | New Conversations | {count} | 15 | 🟢/🟡/🔴 |
| 3 | Disc. Meetings Set | {count} | 5 | 🟢/🟡/🔴 |
| 4 | Disc. Meetings Held | {count} | 4 | 🟢/🟡/🔴 |
| 5 | Proposals Sent | {count} | 2 | 🟢/🟡/🔴 |
| 9 | Task Completion | {pct}% | >90% | 🟢/🟡/🔴 |
| 10 | Activity Log Rate | {pct}% | >95% | 🟢/🟡/🔴 |

(repeat for each rep)

━━━━━━━━━━━━━━━━━━━━
*Overall: {green count} 🟢 | {yellow count} 🟡 | {red count} 🔴*
```
