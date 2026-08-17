import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  ).toISOString();
  const todayEnd = now.toISOString();

  // Calculate hours and minutes until next 00:00 UTC
  const tomorrowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  const diffMs = tomorrowStart.getTime() - now.getTime();
  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const resetsIn = `${hoursLeft}h ${minsLeft}m`;

  if (!accountId || !apiToken) {
    return NextResponse.json({
      success: true,
      quota: {
        configured: false,
        totalNeurons: 0,
        limit: 10000,
        remainingNeurons: 10000,
        estimatedPostsRemaining: 40,
        requestsToday: 0,
        percentUsed: 0,
        resetsIn,
        provider: "Pollinations / Mock",
      },
    });
  }

  const query = `
    query GetWorkersAIUsage($accountTag: String!, $start: String!, $end: String!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          aiInferenceAdaptiveGroups(
            filter: { datetime_geq: $start, datetime_leq: $end }
            limit: 10
          ) {
            sum {
              totalNeurons
            }
            count
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          accountTag: accountId,
          start: todayStart,
          end: todayEnd,
        },
      }),
      next: { revalidate: 30 },
    });

    const data = await res.json();
    const groups = data.data?.viewer?.accounts?.[0]?.aiInferenceAdaptiveGroups || [];

    let totalNeurons = 0;
    let requestsToday = 0;

    for (const g of groups) {
      totalNeurons += g.sum?.totalNeurons || 0;
      requestsToday += g.count || 0;
    }

    const limit = 10000;
    const remainingNeurons = Math.max(0, limit - totalNeurons);
    const estimatedPostsRemaining = Math.max(0, Math.floor(remainingNeurons / 250));
    const percentUsed = Math.min(100, Math.round((totalNeurons / limit) * 100));

    return NextResponse.json({
      success: true,
      quota: {
        configured: true,
        totalNeurons: Math.round(totalNeurons),
        limit,
        remainingNeurons: Math.round(remainingNeurons),
        estimatedPostsRemaining,
        requestsToday,
        percentUsed,
        resetsIn,
        provider: "Cloudflare Workers AI (Flux)",
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      quota: {
        configured: true,
        totalNeurons: 0,
        limit: 10000,
        remainingNeurons: 10000,
        estimatedPostsRemaining: 40,
        requestsToday: 0,
        percentUsed: 0,
        resetsIn,
        provider: "Cloudflare Workers AI (Flux)",
        error: err.message,
      },
    });
  }
}
