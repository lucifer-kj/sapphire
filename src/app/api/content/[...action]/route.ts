import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateStrategicAngles } from '@/mastra/agents/strategyAgent';
import { generateDraftVariantsFromAngles } from '@/mastra/agents/draftAgent';
import { scoreAndEditVariant } from '@/mastra/agents/editorAgent';
import { generateAndStoreImage } from '@/mastra/tools/imageGenerator';

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string[] } }
) {
  const action = params.action?.[0];

  switch (action) {
    case 'generate':
      return handleGenerate(request);
    case 'resume':
      return handleResume(request);
    case 'regenerate':
      return handleRegenerate(request);
    case 'delivery-tick':
      return handleDeliveryTick(request);
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 404 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { action: string[] } }
) {
  const action = params.action?.[0];

  if (action === 'jobs') {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');
    if (!ideaId) {
      return NextResponse.json({ error: 'Missing ideaId parameter' }, { status: 400 });
    }

    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('content_jobs')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ job: data || null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Job fetch failed';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  return NextResponse.json({ error: `Unknown GET action: ${action}` }, { status: 404 });
}

async function handleGenerate(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, raw_content, workspace_id, user_id } = body;
    const ideaText = idea || raw_content;
    const workspaceId = workspace_id || 'default-workspace';
    const authorId = user_id || 'default-user';

    if (!ideaText || !ideaText.trim()) {
      return NextResponse.json({ error: 'Idea content is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Create or query Idea row in Supabase
    const ideaId = crypto.randomUUID();
    const { error: ideaError } = await supabase.from('ideas').insert({
      id: ideaId,
      workspace_id: workspaceId,
      author_id: authorId,
      raw_content: ideaText,
      normalized_content: ideaText.trim(),
      language: 'en',
      status: 'processing',
    });

    if (ideaError) {
      console.warn('Could not insert idea to DB:', ideaError.message);
    }

    // 2. Create Job row in content_jobs
    const jobId = crypto.randomUUID();
    await supabase.from('content_jobs').insert({
      id: jobId,
      workspace_id: workspaceId,
      idea_id: ideaId,
      status: 'processing',
      result_data: { step: 'strategy' },
    });

    // 3. Setup SSE encoder for streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: object) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // STEP 1: Strategy Agent
          sendEvent('step', { step: 'strategy', message: 'Formulating strategic angles...' });
          const angles = await generateStrategicAngles(ideaText);
          await supabase.from('content_jobs').update({
            result_data: { step: 'drafting', angles },
            updated_at: new Date().toISOString(),
          }).eq('id', jobId);

          // STEP 2: Draft Generator (Groq -> Gemini -> OpenRouter LLM chain)
          sendEvent('step', { step: 'drafting', message: 'Generating draft variants via LLM fallback chain...' });
          const rawVariants = await generateDraftVariantsFromAngles(ideaText, angles);

          // STEP 3: Editor & Scorer Agent (Anti-AI pass & dynamic rubric weights)
          sendEvent('step', { step: 'scoring', message: 'Applying anti-AI pass and scoring Hook/CTA metrics...' });
          const finalVariants = await Promise.all(
            rawVariants.map(v => scoreAndEditVariant(v, workspaceId))
          );

          // STEP 4: Store Drafts in Supabase DB
          for (const variant of finalVariants) {
            await supabase.from('drafts').insert({
              id: crypto.randomUUID(),
              workspace_id: workspaceId,
              idea_id: ideaId,
              platform: 'linkedin',
              variant_index: variant.variant_index,
              text: variant.text,
              score: variant.score,
              score_breakdown: variant.score_breakdown,
              model_used: variant.model_used,
            });
          }

          // Mark Idea and Job complete
          await supabase.from('ideas').update({ status: 'drafted' }).eq('id', ideaId);
          await supabase.from('content_jobs').update({
            status: 'completed',
            result_data: { variants: finalVariants },
            updated_at: new Date().toISOString(),
          }).eq('id', jobId);

          sendEvent('complete', {
            ideaId,
            jobId,
            variants: finalVariants,
          });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Generation failed';
          await supabase.from('content_jobs').update({
            status: 'failed',
            error_message: errMsg,
          }).eq('id', jobId);
          sendEvent('error', { error: errMsg });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handleResume(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea_id, selected_variant_id, text, workspace_id, scheduled_for } = body;
    const workspaceId = workspace_id || 'default-workspace';

    if (!text && !selected_variant_id) {
      return NextResponse.json({ error: 'Missing selected variant or text' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Generate Image using Gemini Image Tool (structured prompt + Storage upload)
    const { imageUrl, prompt } = await generateAndStoreImage({
      workspaceId,
      approvedText: text || 'Approved content draft',
    });

    // 2. Insert Post record into Supabase
    const postId = crypto.randomUUID();
    const { data: postData, error: postErr } = await supabase
      .from('posts')
      .insert({
        id: postId,
        workspace_id: workspaceId,
        platform: 'linkedin',
        final_text: text,
        image_url: imageUrl,
        status: 'scheduled',
        scheduled_for: scheduled_for || new Date(Date.now() + 3600 * 1000).toISOString(),
      })
      .select()
      .single();

    if (postErr) {
      console.warn('Could not insert post to DB:', postErr.message);
    }

    return NextResponse.json({
      success: true,
      postId,
      post: postData || { id: postId, status: 'scheduled', final_text: text, image_url: imageUrl },
      imagePrompt: prompt,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Resume execution failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handleRegenerate(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea_id, workspace_id } = body;

    if (!idea_id) {
      return NextResponse.json({ error: 'idea_id is required for regeneration' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check regeneration cap (max 3 regenerations per idea)
    const { data: jobCount } = await supabase
      .from('content_jobs')
      .select('id')
      .eq('idea_id', idea_id);

    if (jobCount && jobCount.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum regeneration limit reached for this idea (cap: 3)' },
        { status: 429 }
      );
    }

    // Delete old drafts for this idea
    await supabase.from('drafts').delete().eq('idea_id', idea_id);

    // Re-query raw idea text
    const { data: ideaData } = await supabase
      .from('ideas')
      .select('raw_content')
      .eq('id', idea_id)
      .single();

    const rawContent = ideaData?.raw_content || 'SaaS productivity framework';

    // Dispatch re-generation logic
    const angles = await generateStrategicAngles(rawContent);
    const rawVariants = await generateDraftVariantsFromAngles(rawContent, angles);
    const finalVariants = await Promise.all(
      rawVariants.map(v => scoreAndEditVariant(v, workspace_id || 'default-workspace'))
    );

    // Write new drafts to DB
    for (const variant of finalVariants) {
      await supabase.from('drafts').insert({
        id: crypto.randomUUID(),
        workspace_id: workspace_id || 'default-workspace',
        idea_id: idea_id,
        platform: 'linkedin',
        variant_index: variant.variant_index,
        text: variant.text,
        score: variant.score,
        score_breakdown: variant.score_breakdown,
        model_used: variant.model_used,
      });
    }

    return NextResponse.json({ success: true, variants: finalVariants });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Regeneration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handleDeliveryTick(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { post_id } = body;
    const supabase = createAdminClient();

    let postsToDeliver: Array<{ id: string; final_text: string; image_url?: string; workspace_id: string }> = [];

    if (post_id) {
      // Manual trigger for a specific post
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('id', post_id);
      if (data) postsToDeliver = data;
    } else {
      // Automatic cron trigger: fetch scheduled posts due now
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_for', new Date().toISOString());
      if (data) postsToDeliver = data;
    }

    const deliveredResults = [];

    for (const post of postsToDeliver) {
      // 1. Atomic claim lock
      const { data: claimedPost } = await supabase
        .from('posts')
        .update({ status: 'delivering', updated_at: new Date().toISOString() })
        .eq('id', post.id)
        .select()
        .single();

      if (!claimedPost && !post_id) continue;

      // 2. Format caption for mobile copy-paste (strip markdown asterisks, clean double line breaks)
      const cleanCaption = post.final_text
        .replace(/\*\*(.*?)\*\*/g, '$1') // strip markdown bold
        .replace(/\*(.*?)\*/g, '$1')     // strip markdown italic
        .replace(/#/g, '\n#')           // ensure hashtags on clean line
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // 3. Update post status to delivered
      await supabase
        .from('posts')
        .update({
          status: 'published', // marked as ready/delivered
          published_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      deliveredResults.push({
        id: post.id,
        status: 'delivered',
        formatted_caption: cleanCaption,
        image_url: post.image_url,
        delivered_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      delivered_count: deliveredResults.length,
      delivered_posts: deliveredResults,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delivery tick execution failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
