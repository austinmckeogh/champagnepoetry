let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

const TOKEN_TTL_MS = 20 * 60 * 1000; // 20 minutes

export async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const refreshToken = process.env.HUBSPOT_REFRESH_TOKEN;
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing HubSpot OAuth credentials');
  }

  const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot token refresh failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS;

  // Persist new refresh token to Vercel env vars if configured
  if (data.refresh_token && data.refresh_token !== refreshToken) {
    await persistRefreshToken(data.refresh_token);
  }

  return cachedAccessToken!;
}

async function persistRefreshToken(newRefreshToken: string): Promise<void> {
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!vercelToken || !projectId) return;

  try {
    // Get the existing env var to find its ID
    const listRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );
    const listData = await listRes.json();
    const existing = listData.envs?.find(
      (e: { key: string }) => e.key === 'HUBSPOT_REFRESH_TOKEN'
    );

    if (existing) {
      await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: newRefreshToken }),
        }
      );
    }
  } catch {
    // Non-fatal: token will be refreshed again on next cold start
    console.error('Failed to persist refresh token to Vercel');
  }
}
