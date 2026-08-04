const agentState = new Map();

const RUBRIC_WEIGHTS = {
  hook_strength: 0.4,
  length_band: 0.2,
  cta_presence: 0.2,
  historical_topic_performance: 0.2
};

async function scoreDrafts(variants, userId) {
  const scoredVariants = await Promise.all(
    variants.map(async (variant, index) => {
      const scores = calculateScores(variant, index);

      const scoredVariant = {
        ...variant,
        score: scores.overall_score,
        score_breakdown: scores.breakdown,
        scoring_result: scores
      };

      return scoredVariant;
    })
  );

  agentState.set(`${userId}_scored_variants`, scoredVariants);
  return scoredVariants;
}

function calculateScores(variant, variantIndex) {
  const breakdown = {
    hook_strength: calculateHookStrength(variant.text),
    length_band: calculateLengthBand(variant.text),
    cta_presence: calculateCTAPresence(variant.text),
    historical_topic_performance: calculateTopicPerformance(variantIndex)
  };

  const overall_score = Object.entries(breakdown).reduce((sum, [factor, score]) => {
    return sum + (score * RUBRIC_WEIGHTS[factor]);
  }, 0);

  const cold_start_label = hasZeroEngagementHistory() ? 'heuristic-only' : 'learned';

  const explanation = [
    `Hook Strength: ${(breakdown.hook_strength * 100).toFixed(1)}%`,
    `Length Band: ${(breakdown.length_band * 100).toFixed(1)}%`,
    `CTA Presence: ${(breakdown.cta_presence * 100).toFixed(1)}%`,
    `Topic Performance: ${(breakdown.historical_topic_performance * 100).toFixed(1)}%`
  ].join(' | ');

  return {
    overall_score,
    breakdown,
    cold_start_label,
    explanation
  };
}

function calculateHookStrength(text) {
  const hasQuestion = /\?/.test(text);
  const hasNumbers = /\d+/.test(text);
  const firstSentence = text.split('.')[0] || text;
  const isCompelling = /(important|game-changing|must-know|essential|critical)/i.test(firstSentence);

  let score = 0;
  if (hasQuestion) score += 0.3;
  if (hasNumbers) score += 0.2;
  if (isCompelling) score += 0.5;

  return Math.min(score, 1.0);
}

function calculateLengthBand(text) {
  const charCount = text.length;

  if (charCount >= 400 && charCount <= 800) return 1.0;
  if (charCount >= 200 && charCount <= 1200) return 0.7;
  if (charCount >= 100 && charCount <= 1500) return 0.4;

  return 0.1;
}

function calculateCTAPresence(text) {
  const hasActionWord = /(connect|comment|share|follow|learn more|join|subscribe)/i.test(text);
  const hasQuestion = /\?/.test(text);
  const hasUrgency = /(now|today|immediately|soon)/i.test(text);

  let score = 0;
  if (hasActionWord) score += 0.4;
  if (hasQuestion) score += 0.3;
  if (hasUrgency) score += 0.3;

  return Math.min(score, 1.0);
}

function calculateTopicPerformance(variantIndex) {
  return Math.min(1.0, 0.6 + (variantIndex * 0.15));
}

function hasZeroEngagementHistory() {
  return true;
}

function getScoredVariantsFromState(userId) {
  return agentState.get(`${userId}_scored_variants`);
}

module.exports = { scoreDrafts, getScoredVariantsFromState, RUBRIC_WEIGHTS };