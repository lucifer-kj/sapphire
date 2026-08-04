const { executeIdeaToDraftWorkflow } = require('../../../mastra/workflows/ideaToDraft');

async function POST(request) {
  try {
    const body = await request.json();
    const { idea, userId } = body;

    if (!idea || !idea.trim()) {
      return new Response(JSON.stringify({ error: 'Idea cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (idea.length > 500) {
      return new Response(JSON.stringify({ error: 'Idea exceeds maximum length of 500 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await executeIdeaToDraftWorkflow(idea, userId || 'default-user');

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

async function GET(request) {
  const workflows = getAllWorkflows();
  return new Response(JSON.stringify({ workflows, count: workflows.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

module.exports = { POST, GET };