import { RubricWeights } from '@/types';

export const DEFAULT_RUBRIC_WEIGHTS: RubricWeights = {
  workspace_id: 'default',
  hook_weight: 0.4,
  length_weight: 0.2,
  cta_weight: 0.2,
  topic_weight: 0.2,
  updated_at: new Date().toISOString(),
};

export function calculateHookStrength(text: string): number {
  const hasQuestion = /\?/.test(text);
  const hasNumbers = /\d+/.test(text);
  const firstSentence = text.split('.')[0] || text;
  const isCompelling = /(important|game-changing|must-know|essential|critical|breakthrough|framework|step)/i.test(firstSentence);

  let score = 0;
  if (hasQuestion) score += 0.3;
  if (hasNumbers) score += 0.2;
  if (isCompelling) score += 0.5;

  return Math.min(score, 1.0);
}

export function calculateLengthBand(text: string): number {
  const charCount = text.length;

  if (charCount >= 300 && charCount <= 900) return 1.0;
  if (charCount >= 150 && charCount <= 1200) return 0.7;
  if (charCount >= 80 && charCount <= 1500) return 0.4;

  return 0.2;
}

export function calculateCTAPresence(text: string): number {
  const hasActionWord = /(connect|comment|share|follow|learn more|join|subscribe|what do you think|thoughts\?)/i.test(text);
  const hasQuestion = /\?/.test(text);
  const hasUrgency = /(now|today|immediately|soon|take action)/i.test(text);

  let score = 0;
  if (hasActionWord) score += 0.4;
  if (hasQuestion) score += 0.4;
  if (hasUrgency) score += 0.2;

  return Math.min(score, 1.0);
}

export function calculateTopicQuality(text: string): number {
  // Real content-based topic quality evaluation
  const wordCount = text.trim().split(/\s+/).length;
  const hasStructure = text.includes('\n') || text.includes('•') || text.includes('-');
  
  let score = 0.5;
  if (wordCount > 30) score += 0.2;
  if (hasStructure) score += 0.3;

  return Math.min(score, 1.0);
}

export function calculateVariantScore(text: string, weights: RubricWeights = DEFAULT_RUBRIC_WEIGHTS) {
  const hookScore = calculateHookStrength(text);
  const lengthScore = calculateLengthBand(text);
  const ctaScore = calculateCTAPresence(text);
  const topicScore = calculateTopicQuality(text);

  const overallScore =
    hookScore * weights.hook_weight +
    lengthScore * weights.length_weight +
    ctaScore * weights.cta_weight +
    topicScore * weights.topic_weight;

  return {
    score: parseFloat(overallScore.toFixed(2)),
    breakdown: {
      hook_strength: parseFloat(hookScore.toFixed(2)),
      length_band: parseFloat(lengthScore.toFixed(2)),
      cta_presence: parseFloat(ctaScore.toFixed(2)),
      topic_quality: parseFloat(topicScore.toFixed(2)),
    },
  };
}
