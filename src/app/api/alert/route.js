async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SHARED_SECRET;

    if (!expectedSecret || authHeader !== 'Bearer ' + expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { alertType, message, severity, postId, error } = body;

    const alert = {
      id: crypto.randomUUID(),
      alertType,
      message,
      severity,
      postId: postId || null,
      error: error || null,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    console.log(`[ALERT] ${alert.severity}: ${alert.message}`);

    return new Response(JSON.stringify({ success: true, alertId: alert.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function GET(request) {
  return new Response(JSON.stringify({ alerts: [], count: 0 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

module.exports = { POST, GET };