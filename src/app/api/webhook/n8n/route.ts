import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-sapphire-secret') || request.headers.get('authorization');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized callback signature' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, ideaId, workspaceId, status, variants, error } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    if (status === 'failed') {
      return NextResponse.json({
        received: true,
        jobId,
        status: 'failed',
        message: error || 'Job processing failed in n8n',
      });
    }

    return NextResponse.json({
      received: true,
      jobId,
      ideaId,
      workspaceId,
      variantsCount: Array.isArray(variants) ? variants.length : 0,
      processedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
