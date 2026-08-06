import { NextResponse } from 'next/server';
import { Post } from '@/types';

export async function GET() {
  try {
    const mockPosts: Post[] = [
      {
        id: 'post-101',
        workspace_id: 'default-workspace',
        platform: 'linkedin',
        final_text: '🚀 Excited to share our latest research on AI content pipelines and autonomous multi-agent systems! Here is how modern teams save 10+ hours a week:',
        status: 'scheduled',
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        comments: 0,
        reposts: 0,
      },
      {
        id: 'post-102',
        workspace_id: 'default-workspace',
        platform: 'linkedin',
        final_text: 'Why traditional content calendars fail without adaptive learning loops: A quick breakdown of metrics that actually drive engagement.',
        status: 'scheduled',
        scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        comments: 0,
        reposts: 0,
      },
      {
        id: 'post-100',
        workspace_id: 'default-workspace',
        platform: 'linkedin',
        final_text: '3 simple principles for building reliable LLM applications on serverless architecture.',
        status: 'published',
        scheduled_for: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        linkedin_post_urn: 'urn:li:ugcPost:7162534928192038192',
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        likes: 42,
        comments: 11,
        reposts: 5,
      },
    ];

    return NextResponse.json({ posts: mockPosts, count: mockPosts.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { finalText, platform, scheduledFor, draftId } = body;

    if (!finalText || !finalText.trim()) {
      return NextResponse.json({ error: 'finalText is required' }, { status: 400 });
    }

    const newPost: Post = {
      id: `post-${crypto.randomUUID().substring(0, 8)}`,
      workspace_id: 'default-workspace',
      draft_id: draftId,
      platform: platform || 'linkedin',
      final_text: finalText,
      status: 'scheduled',
      scheduled_for: scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      comments: 0,
      reposts: 0,
    };

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
