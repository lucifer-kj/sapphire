import { BrandProfile, DraftVariant } from '@/types';
import { StrategicAngle } from './strategyAgent';

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY missing');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY missing');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

export async function callLLMWithFallback(systemPrompt: string, userPrompt: string): Promise<{ text: string; modelUsed: string }> {
  // 1. Try Groq (Sub-second fast Llama 3.3 70B)
  try {
    const text = await callGroq(systemPrompt, userPrompt);
    if (text) return { text, modelUsed: 'groq/llama-3.3-70b' };
  } catch (err) {
    console.warn('Groq LLM call failed, falling back to Gemini:', err instanceof Error ? err.message : err);
  }

  // 2. Fallback to Gemini 2.0 Flash
  try {
    const text = await callGemini(systemPrompt, userPrompt);
    if (text) return { text, modelUsed: 'gemini-2.0-flash' };
  } catch (err) {
    console.warn('Gemini LLM call failed, falling back to OpenRouter:', err instanceof Error ? err.message : err);
  }

  // 3. Emergency Fallback to OpenRouter
  try {
    const text = await callOpenRouter(systemPrompt, userPrompt);
    if (text) return { text, modelUsed: 'openrouter/llama-3.3-70b' };
  } catch (err) {
    console.warn('OpenRouter LLM call failed:', err instanceof Error ? err.message : err);
  }

  // Fallback to local template if all external LLM keys fail
  return {
    text: `Here is an actionable post about "${userPrompt.slice(0, 40)}...":\n\n3 key lessons every creator needs to know:\n1. Prioritize hook clarity\n2. Format for mobile readability\n3. Always end with a question.\n\nWhat's your take? #ContentStrategy #Growth`,
    modelUsed: 'template-fallback',
  };
}

export async function generateDraftVariantsFromAngles(
  rawIdea: string,
  angles: StrategicAngle[],
  brandProfile?: BrandProfile
): Promise<DraftVariant[]> {
  const persona = brandProfile?.persona || 'Thought Leader in Software & AI';
  const tone = brandProfile?.tone || 'Actionable, engaging, professional';
  const topics = (brandProfile?.topics || ['Tech', 'Growth']).join(', ');

  const systemPrompt = `You are an expert social media copywriter creating engaging posts for LinkedIn and Twitter.
Brand Persona: ${persona}
Brand Tone: ${tone}
Target Topics: ${topics}

Rules:
- Write clean line breaks (double line breaks between short paragraphs) for mobile readability.
- Do NOT use Markdown bold headers or asterisks like **Header** as social platforms strip them on paste.
- End with a compelling call-to-action question.
- Include 2-3 targeted hashtags at the very bottom.`;

  const variants: DraftVariant[] = [];

  for (let i = 0; i < angles.length; i++) {
    const angle = angles[i];
    const userPrompt = `Idea: ${rawIdea}\nStrategic Angle (${angle.angle_type}): ${angle.title}\nHook Guidance: ${angle.hook_idea}\nTarget Takeaway: ${angle.target_takeaway}`;

    const { text, modelUsed } = await callLLMWithFallback(systemPrompt, userPrompt);

    variants.push({
      variant_index: i,
      platform: 'linkedin',
      text: text.trim(),
      score: 0,
      model_used: modelUsed,
      created_at: new Date().toISOString(),
    });
  }

  return variants;
}
