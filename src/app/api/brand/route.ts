import { NextResponse } from 'next/server';
import { BrandProfile } from '@/types';

export async function GET() {
  try {
    const brandProfile: BrandProfile = {
      workspace_id: 'default-workspace',
      company_name: 'Acme AI Labs',
      persona: 'Thought Leader in AI & Software Engineering',
      tone: 'Professional, actionable, data-driven, approachable',
      topics: ['AI Automation', 'Serverless', 'SaaS Growth', 'Future of Work'],
      example_posts: [
        '3 simple principles for building reliable LLM applications on serverless architecture...',
      ],
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ profile: brandProfile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { company_name, persona, tone, topics, example_posts } = body;

    const updatedProfile: BrandProfile = {
      workspace_id: 'default-workspace',
      company_name: company_name || 'Acme Inc.',
      persona: persona || 'Thought Leader',
      tone: tone || 'Professional',
      topics: Array.isArray(topics) ? topics : ['AI', 'Tech'],
      example_posts: Array.isArray(example_posts) ? example_posts : [],
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
