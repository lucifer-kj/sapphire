const { publishToLinkedIn } = require('../../../../../mastra/agents/publisherTool');

async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!state) {
    return new Response(JSON.stringify({ error: 'Missing state parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const storedState = await getStoredOAuthState(state);
  if (!storedState) {
    return new Response(JSON.stringify({ error: 'Invalid or expired state parameter' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);
    const { access_token, refresh_token, expires_in } = tokenResponse;

    const account = {
      id: crypto.randomUUID(),
      user_id: storedState.user_id,
      linkedin_access_token: encryptToken(access_token),
      linkedin_refresh_token: encryptToken(refresh_token),
      token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return new Response(JSON.stringify({ success: true, account_id: account.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Token exchange failed: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getStoredOAuthState(state) {
  return null;
}

async function exchangeCodeForToken(code) {
  return {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    expires_in: 3600,
    scope: 'w_member_social r_liteprofile r_emailaddress'
  };
}

function encryptToken(token) {
  return 'encrypted:' + token;
}

module.exports = { GET };