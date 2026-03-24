#!/usr/bin/env bash
# Refresh HubSpot OAuth token and update both ~/.openclaw/.env and ~/.openclaw/openclaw.json
set -euo pipefail

ENV_FILE="$HOME/.openclaw/.env"
CONFIG_FILE="$HOME/.openclaw/openclaw.json"

# Read current values from .env
REFRESH_TOKEN=$(grep HUBSPOT_REFRESH_TOKEN "$ENV_FILE" | cut -d= -f2-)
CLIENT_ID=$(grep HUBSPOT_CLIENT_ID "$ENV_FILE" | cut -d= -f2-)
CLIENT_SECRET=$(grep HUBSPOT_CLIENT_SECRET "$ENV_FILE" | cut -d= -f2-)

if [ -z "$REFRESH_TOKEN" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
  echo "Error: Missing HUBSPOT_REFRESH_TOKEN, HUBSPOT_CLIENT_ID, or HUBSPOT_CLIENT_SECRET in $ENV_FILE"
  exit 1
fi

# Request new tokens
RESPONSE=$(curl -s -X POST https://api.hubapi.com/oauth/v1/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$REFRESH_TOKEN&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo "Error refreshing token: $RESPONSE"
  exit 1
fi

NEW_ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
NEW_REFRESH_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['refresh_token'])")
QUARTERLY_TARGET=$(grep QUARTERLY_TARGET "$ENV_FILE" | cut -d= -f2- || echo "500000")

# Update .env
cat > "$ENV_FILE" <<EOF
HUBSPOT_ACCESS_TOKEN=$NEW_ACCESS_TOKEN
HUBSPOT_REFRESH_TOKEN=$NEW_REFRESH_TOKEN
HUBSPOT_CLIENT_ID=$CLIENT_ID
HUBSPOT_CLIENT_SECRET=$CLIENT_SECRET
QUARTERLY_TARGET=$QUARTERLY_TARGET
EOF

# Update openclaw.json env section
python3 - <<PYEOF
import json

with open("$CONFIG_FILE") as f:
    config = json.load(f)

config.setdefault("env", {})
config["env"]["HUBSPOT_ACCESS_TOKEN"] = "$NEW_ACCESS_TOKEN"
config["env"]["HUBSPOT_REFRESH_TOKEN"] = "$NEW_REFRESH_TOKEN"
config["env"]["HUBSPOT_CLIENT_ID"] = "$CLIENT_ID"
config["env"]["HUBSPOT_CLIENT_SECRET"] = "$CLIENT_SECRET"
config["env"]["QUARTERLY_TARGET"] = "$QUARTERLY_TARGET"

with open("$CONFIG_FILE", "w") as f:
    json.dump(config, f, indent=2)
PYEOF

echo "Token refreshed successfully at $(date)"
