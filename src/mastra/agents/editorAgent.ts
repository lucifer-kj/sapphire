import { DraftVariant, RubricWeights } from '@/types';
import { createAdminClient } from '@/lib/supabase/server';

const AI_BUZZWORDS = [
  /\bdelve\b/gi,
  /\bgame-changer\b/gi,
  /\bunleash\b/gi,
  /\btestament\b/gi,
  /\btapestry\b/gi,
  /\bbeacon\b/gi,
  /\bin conclusion\b/gi,
  /\bever-evolving\b/gi,
  /\bpivot\b/gi,
  /\blandscape\b/gi,
  /\bfoster\b/gi,
  /\bsynergy\b/gi,
];

export function stripAIBuzzwords(text: string): string {
  let cleaned = text;
  for (const pattern of AI_BUZZWORDS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

export function calculateHookScore(text: string): { score: number; rationale: string } {
  const firstLine = text.split('\n')[0] || text;
  const hasQuestion = /\?/.test(firstLine);
  const hasNumbers = /\d+/.test(firstLine);
  const hasPowerWords = /(how|why|mistake|stop|proven|framework|step|rule|secret|strategy)/i.test(firstLine);

  let score = 0.3;
  const reasons: string[] = [];

  if (hasQuestion) {
    score += 0.3;
    reasons.push('opens with an engaging question');
  }
  if (hasNumbers) {
    score += 0.2;
    reasons.push('uses specific quantitative figures');
  }
  if (hasPowerWords) {
    score += 0.2;
    reasons.push('includes strong high-converting trigger words');
  }

  const finalScore = Math.min(score, 1.0);
  const rationale = reasons.length > 0
    ? `Strong opening hook: ${reasons.join(', ')}.`
    : 'Standard opening line; consider adding numbers or a provocative question for higher engagement.';

  return { score: finalScore, rationale };
}

export function calculateCTAScore(text: string): { score: number; rationale: string } {
  const lastLines = text.split('\n').slice(-3).join(' ');
  const hasQuestion = /\?/.test(lastLines);
  const hasAction = /(comment|share|thoughts\?|what do you think|agree\?|let me know)/i.test(lastLines);

  let score = 0.2;
  const reasons: string[] = [];

  if (hasQuestion) {
    score += 0.4;
    reasons.push('asks a direct question');
  }
  if (hasAction) {
    score += 0.4;
    reasons.push('prompts explicit audience response (comments/shares)');
  }

  const finalScore = Math.min(score, 1.0);
  const rationale = reasons.length > 0
    ? `Clear call to action: ${reasons.join(' and ')}.`
    : 'Weak closing CTA; add an explicit question or comment prompt to drive post comments.';

  return { score: finalScore, rationale };
}

export function calculateLengthScore(text: string): number {
  const len = text.length;
  if (len >= 300 && len <= 900) return 1.0;
  if (len >= 150 && len <= 1400) return 0.7;
  return 0.3;
}

export async function scoreAndEditVariant(
  variant: DraftVariant,
  workspaceId: string
): Promise<DraftVariant> {
  // 1. Anti-AI Pass: strip clichés
  const cleanedText = stripAIBuzzwords(variant.text);

  // 2. Fetch live workspace rubric weights from Supabase
  let weights: RubricWeights = {
    workspace_id: workspaceId,
    hook_weight: 0.4,
    length_weight: 0.2,
    cta_weight: 0.2,
    topic_weight: 0.2,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('rubric_weights')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (data && data.length > 0) {
      const hookRow = data.find(r => r.factor_name === 'hook_strength');
      const lengthRow = data.find(r => r.factor_name === 'length_band');
      const ctaRow = data.find(r => r.factor_name === 'cta_presence');
      const topicRow = data.find(r => r.factor_name === 'topic_quality');

      if (hookRow) weights.hook_weight = Number(hookRow.weight);
      if (lengthRow) weights.length_weight = Number(lengthRow.weight);
      if (ctaRow) weights.cta_weight = Number(ctaRow.weight);
      if (topicRow) weights.topic_weight = Number(topicRow.weight);
    }
  } catch (err) {
    console.warn('Could not fetch dynamic rubric weights, using defaults:', err);
  }

  // 3. Compute content scores & rationale
  const { score: hookScore, rationale: hookRationale } = calculateHookScore(cleanedText);
  const lengthScore = calculateLengthScore(cleanedText);
  const { score: ctaScore, rationale: ctaRationale } = calculateCTAScore(cleanedText);
  const topicScore = 0.8;

  const totalScore =
    hookScore * weights.hook_weight +
    lengthScore * weights.length_weight +
    ctaScore * weights.cta_weight +
    topicScore * weights.topic_weight;

  const overallRationale = `${hookRationale} ${ctaRationale}`;

  return {
    ...variant,
    text: cleanedText,
    score: Number(totalScore.toFixed(2)),
    score_breakdown: {
      hook_strength: Number(hookScore.toFixed(2)),
      length_band: Number(lengthScore.toFixed(2)),
      cta_presence: Number(ctaScore.toFixed(2)),
      topic_quality: Number(topicScore.toFixed(2)),
      hook_rationale: hookRationale,
      cta_rationale: ctaRationale,
      overall_rationale: overallRationale,
    },
  };
}
