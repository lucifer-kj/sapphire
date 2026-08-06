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

export function calculateHookScore(text: string): number {
  const firstLine = text.split('\n')[0] || text;
  const hasQuestion = /\?/.test(firstLine);
  const hasNumbers = /\d+/.test(firstLine);
  const hasPowerWords = /(how|why|mistake|stop|proven|framework|step|rule|secret|strategy)/i.test(firstLine);

  let score = 0.3;
  if (hasQuestion) score += 0.3;
  if (hasNumbers) score += 0.2;
  if (hasPowerWords) score += 0.2;

  return Math.min(score, 1.0);
}

export function calculateCTAScore(text: string): number {
  const lastLines = text.split('\n').slice(-3).join(' ');
  const hasQuestion = /\?/.test(lastLines);
  const hasAction = /(comment|share|thoughts\?|what do you think|agree\?|let me know)/i.test(lastLines);

  let score = 0.2;
  if (hasQuestion) score += 0.4;
  if (hasAction) score += 0.4;

  return Math.min(score, 1.0);
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
      // Aggregate weights array or single row
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

  // 3. Compute real content scores
  const hookScore = calculateHookScore(cleanedText);
  const lengthScore = calculateLengthScore(cleanedText);
  const ctaScore = calculateCTAScore(cleanedText);
  const topicScore = 0.8; // Baseline structural quality

  const totalScore =
    hookScore * weights.hook_weight +
    lengthScore * weights.length_weight +
    ctaScore * weights.cta_weight +
    topicScore * weights.topic_weight;

  return {
    ...variant,
    text: cleanedText,
    score: Number(totalScore.toFixed(2)),
    score_breakdown: {
      hook_strength: Number(hookScore.toFixed(2)),
      length_band: Number(lengthScore.toFixed(2)),
      cta_presence: Number(ctaScore.toFixed(2)),
      topic_quality: Number(topicScore.toFixed(2)),
    },
  };
}
