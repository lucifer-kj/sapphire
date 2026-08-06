import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideaId, rawContent, imageUrl, platform, workspaceId, brandProfile } = body;

    if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
      return NextResponse.json({ error: 'rawContent is required' }, { status: 400 });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: 'N8N_WEBHOOK_URL environment variable is not configured' }, { status: 500 });
    }

    const jobId = crypto.randomUUID();

    const n8nPayload = {
      jobId,
      ideaId: ideaId || crypto.randomUUID(),
      workspaceId: workspaceId || 'default-workspace',
      rawContent,
      imageUrl: imageUrl || null,
      platform: platform || 'linkedin',
      brandProfile: brandProfile || {
        persona: 'Thought Leader',
        tone: 'Professional & Engaging',
        topics: ['AI', 'Productivity', 'Business'],
      },
      secret: process.env.N8N_WEBHOOK_SECRET || '',
      submittedAt: new Date().toISOString(),
    };

    // 1. Try POST request first (recommended for n8n webhook nodes receiving JSON)
    let n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sapphire-Secret': process.env.N8N_WEBHOOK_SECRET || '',
      },
      body: JSON.stringify(n8nPayload),
    });

    // 2. If n8n webhook node is configured for GET instead of POST, fallback gracefully to GET
    if (n8nResponse.status === 404) {
      const responseText = await n8nResponse.clone().text();
      if (responseText.includes('GET request')) {
        const queryParams = new URLSearchParams({
          jobId,
          ideaId: n8nPayload.ideaId,
          rawContent: rawContent.substring(0, 500),
          platform: n8nPayload.platform,
        }).toString();

        const getUrl = webhookUrl.includes('?') ? `${webhookUrl}&${queryParams}` : `${webhookUrl}?${queryParams}`;

        n8nResponse = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'X-Sapphire-Secret': process.env.N8N_WEBHOOK_SECRET || '',
          },
        });
      }
    }

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      return NextResponse.json(
        {
          error: `n8n webhook failed with status ${n8nResponse.status}`,
          details: errorText,
          jobId,
        },
        { status: 502 }
      );
    }

    let n8nResponseBody = {};
    try {
      n8nResponseBody = await n8nResponse.json();
    } catch {
      n8nResponseBody = { message: 'n8n webhook triggered successfully' };
    }

    return NextResponse.json({
      success: true,
      jobId,
      ideaId: n8nPayload.ideaId,
      status: 'submitted',
      n8nResponse: n8nResponseBody,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
