---
name: hubspot-activity-logger
description: Quick activity logging via natural language — log calls, emails, meetings, and notes to HubSpot
metadata:
  openclaw:
    emoji: "📝"
    requires:
      skills: ["kwall1/hubspot"]
      env: ["HUBSPOT_ACCESS_TOKEN"]
---

# HubSpot Activity Logger

## When to use

Run this skill when a user wants to quickly log an activity (call, email, meeting, or note) to HubSpot via natural language. Examples:

- "Log a call with Chief Martinez at Tampa PD about budget approval, 15 min"
- "Note on the Acme deal: they need board approval before moving forward"
- "Had a 30 min meeting with Sarah at BioTech Corp about implementation timeline"
- "Email sent to John at Metro Fire re: pricing proposal"

## Steps

1. **Parse the natural language input** to extract:
   - **Activity type**: call, email, meeting, or note
   - **Contact name**: the person involved
   - **Company name**: if mentioned
   - **Deal name**: if mentioned
   - **Subject/topic**: what the activity was about
   - **Duration**: if mentioned (for calls and meetings)
   - **Direction**: inbound or outbound (default: outbound for calls/emails)
   - **Body/notes**: any additional detail

2. **Look up the contact** using HubSpot contacts search:
   - Search by name (firstname, lastname)
   - If multiple matches, pick the best match or ask the user to clarify
   - If no match, inform the user and ask if they want to create the contact

3. **Look up the company** (if mentioned) using HubSpot companies search:
   - Search by name
   - If not mentioned, check the contact's associated company

4. **Look up the deal** (if mentioned) using HubSpot deals search:
   - Search by deal name
   - If not mentioned, check deals associated with the contact

5. **Create the engagement** using HubSpot engagements tool:
   - **Call**: type=CALL, body={notes}, duration={ms}, direction={direction}
   - **Email**: type=EMAIL, subject={topic}, body={notes}
   - **Meeting**: type=MEETING, title={topic}, body={notes}, startTime, endTime (based on duration)
   - **Note**: type=NOTE, body={full description}

6. **Associate the engagement** with:
   - The contact (always)
   - The company (if found)
   - The deal (if found)

7. **Confirm back** to the user with the details of what was logged.

## Output Format

Format as Slack blocks:

```
*📝 Activity Logged*

*Type:* {Call/Email/Meeting/Note}
*Contact:* {contact name}
*Company:* {company name}
*Deal:* {deal name or "—"}
*Subject:* {topic}
*Duration:* {duration or "—"}
*Notes:* {body}

_Logged to HubSpot at {timestamp}_
```

If the contact wasn't found:

```
*📝 Activity Logger*

⚠️ Could not find contact "{name}" in HubSpot.
Did you mean one of these?
• {suggestion 1}
• {suggestion 2}

Or reply with more details and I'll try again.
```

If ambiguous (multiple matching contacts or deals):

```
*📝 Activity Logger*

🤔 Found multiple matches for "{name}":
1. {contact 1 name} — {company} — {email}
2. {contact 2 name} — {company} — {email}

Which one did you mean? Reply with the number.
```
