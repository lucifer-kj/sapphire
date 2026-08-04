const { resumeWorkflow } = require('../../../mastra/workflows/ideaToDraft');

async function POST(request) {
  try {
    const body = await request.json();
    const { runId, decision, editedText } = body;

    if (!runId) {
      return new Response(JSON.stringify({ error: 'runId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['approve', 'edit', 'regenerate', 'reject'].includes(decision)) {
      return new Response(JSON.stringify({ error: 'Invalid decision. Must be: approve, edit, regenerate, or reject' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = resumeWorkflow(runId, decision, editedText);

    if (result.error) {
      const statusCode = result.code === 'NOT_FOUND' ? 404 : 409;
      return new Response(JSON.stringify(result), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result), {
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

module.exports = { POST };