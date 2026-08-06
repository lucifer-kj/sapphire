import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const analyticsData = {
      summary: {
        totalPostsPublished: 24,
        totalLikes: 482,
        totalComments: 128,
        totalReposts: 64,
        avgEngagementRate: 5.4, // percentage
      },
      learnedWeights: {
        hook_strength: 0.42,
        length_band: 0.18,
        cta_presence: 0.22,
        historical_topic_performance: 0.18,
        lastReconciledAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      topPosts: [
        {
          id: 'post-100',
          final_text: '3 simple principles for building reliable LLM applications on serverless architecture.',
          platform: 'linkedin',
          published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          likes: 142,
          comments: 38,
          reposts: 19,
          engagementRate: 8.7,
        },
        {
          id: 'post-98',
          final_text: 'Why AI Content Automation is transforming modern marketing agencies in 2026.',
          platform: 'linkedin',
          published_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
          likes: 98,
          comments: 24,
          reposts: 12,
          engagementRate: 6.2,
        },
        {
          id: 'post-95',
          final_text: 'The secret to consistent LinkedIn growth isn’t posting 5x a day — it’s high-hook clarity.',
          platform: 'linkedin',
          published_at: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
          likes: 85,
          comments: 19,
          reposts: 8,
          engagementRate: 5.8,
        },
      ],
      performanceTrends: [
        { date: 'Mon', likes: 45, comments: 12, reposts: 6 },
        { date: 'Tue', likes: 62, comments: 18, reposts: 9 },
        { date: 'Wed', likes: 98, comments: 24, reposts: 12 },
        { date: 'Thu', likes: 142, comments: 38, reposts: 19 },
        { date: 'Fri', likes: 75, comments: 21, reposts: 10 },
        { date: 'Sat', likes: 30, comments: 8, reposts: 4 },
        { date: 'Sun', likes: 30, comments: 7, reposts: 4 },
      ],
    };

    return NextResponse.json(analyticsData);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
