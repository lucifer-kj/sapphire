import { RubricWeights, EngagementSnapshot } from '@/types';

export function reconcileRubricWeights(
  currentWeights: RubricWeights,
  snapshots: EngagementSnapshot[]
): RubricWeights {
  if (snapshots.length === 0) return currentWeights;

  const totalEngagement = snapshots.reduce((sum, s) => sum + s.likes + s.comments + s.reposts, 0);
  const avgEngagement = totalEngagement / snapshots.length;

  // Small adjustments based on high engagement threshold
  let hookDelta = 0;
  let ctaDelta = 0;

  if (avgEngagement > 15) {
    hookDelta = 0.05;
    ctaDelta = 0.02;
  }

  const updated: RubricWeights = {
    ...currentWeights,
    hook_weight: Math.min(0.6, Math.max(0.1, currentWeights.hook_weight + hookDelta)),
    cta_weight: Math.min(0.4, Math.max(0.1, currentWeights.cta_weight + ctaDelta)),
    updated_at: new Date().toISOString(),
  };

  return updated;
}
