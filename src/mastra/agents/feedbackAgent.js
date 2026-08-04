const agentState = new Map();

const RUBRIC_WEIGHTS = {
  hook_strength: 0.4,
  length_band: 0.2,
  cta_presence: 0.2,
  historical_topic_performance: 0.2
};

async function reconcileRubricWeights() {
  const engagementData = await fetchAllEngagementSnapshots();

  if (engagementData.length === 0) {
    return { status: 'no_data', message: 'No engagement data available for reconciliation' };
  }

  const factorAdjustments = {
    hook_strength: calculateHookAdjustment(engagementData),
    length_band: calculateLengthAdjustment(engagementData),
    cta_presence: calculateCTAAdjustment(engagementData),
    historical_topic_performance: calculateTopicAdjustment(engagementData)
  };

  const updatedWeights = {};
  for (const [factor, adjustment] of Object.entries(factorAdjustments)) {
    const currentWeight = RUBRIC_WEIGHTS[factor];
    const newWeight = Math.max(0.05, Math.min(0.8, currentWeight + adjustment));
    updatedWeights[factor] = parseFloat(newWeight.toFixed(3));
  }

  const totalWeight = Object.values(updatedWeights).reduce((sum, w) => sum + w, 0);
  for (const factor of Object.keys(updatedWeights)) {
    updatedWeights[factor] = parseFloat((updatedWeights[factor] / totalWeight).toFixed(3));
  }

  const result = {
    status: 'completed',
    previousWeights: { ...RUBRIC_WEIGHTS },
    updatedWeights,
    adjustments: factorAdjustments,
    dataPoints: engagementData.length,
    reconciledAt: new Date().toISOString()
  };

  agentState.set('last_reconciliation', result);

  return result;
}

function calculateHookAdjustment(data) {
  const highEngagementPosts = data.filter(d => d.likes + d.comments + d.reposts > 20);
  const lowEngagementPosts = data.filter(d => d.likes + d.comments + d.reposts <= 5);

  if (highEngagementPosts.length === 0 && lowEngagementPosts.length === 0) return 0;

  const highHookScore = highEngagementPosts.reduce((sum, d) => sum + (d.hook_score || 0.5), 0) / highEngagementPosts.length;
  const lowHookScore = lowEngagementPosts.reduce((sum, d) => sum + (d.hook_score || 0.3), 0) / lowEngagementPosts.length;

  return (highHookScore - lowHookScore) * 0.05;
}

function calculateLengthAdjustment(data) {
  const optimalLengthPosts = data.filter(d => d.charCount >= 400 && d.charCount <= 800);
  const nonOptimalPosts = data.filter(d => d.charCount < 400 || d.charCount > 800);

  if (optimalLengthPosts.length === 0) return 0;

  const optimalEngagement = optimalLengthPosts.reduce((sum, d) => sum + d.totalEngagement, 0) / optimalLengthPosts.length;
  const nonOptimalEngagement = nonOptimalPosts.reduce((sum, d) => sum + d.totalEngagement, 0) / nonOptimalPosts.length;

  return (optimalEngagement - nonOptimalEngagement) * 0.03;
}

function calculateCTAAdjustment(data) {
  const ctaPosts = data.filter(d => d.hasCTA);
  const nonCtaPosts = data.filter(d => !d.hasCTA);

  if (ctaPosts.length === 0) return 0;

  const ctaEngagement = ctaPosts.reduce((sum, d) => sum + d.totalEngagement, 0) / ctaPosts.length;
  const nonCtaEngagement = nonCtaPosts.reduce((sum, d) => sum + d.totalEngagement, 0) / nonCtaPosts.length;

  return (ctaEngagement - nonCtaEngagement) * 0.04;
}

function calculateTopicAdjustment(data) {
  if (data.length < 5) return 0;

  const sorted = data.sort((a, b) => b.totalEngagement - a.totalEngagement);
  const topPerforming = sorted.slice(0, Math.floor(sorted.length * 0.2));
  const bottomPerforming = sorted.slice(-Math.floor(sorted.length * 0.2));

  const topScore = topPerforming.reduce((sum, d) => sum + (d.topic_score || 0.5), 0) / topPerforming.length;
  const bottomScore = bottomPerforming.reduce((sum, d) => sum + (d.topic_score || 0.3), 0) / bottomPerforming.length;

  return (topScore - bottomScore) * 0.05;
}

async function fetchAllEngagementSnapshots() {
  return [];
}

function getLastReconciliation() {
  return agentState.get('last_reconciliation') || null;
}

module.exports = { reconcileRubricWeights, getLastReconciliation, RUBRIC_WEIGHTS };