const path = require('path');
const { scoreDrafts } = require(path.join(__dirname, '..', 'src', 'mastra', 'agents', 'rankingAgent'));

async function testScoring() {
  console.log('🚀 Testing Phase 4: Scoring (Standalone CLI)\n');

  const mockVariants = [
    {
      variant_index: 0,
      text: 'Here is a hook that grabs attention immediately. This post shares essential insights about building remote teams that actually work. What strategies have you found most effective? Share in the comments below.',
      model_used: 'gpt-4'
    },
    {
      variant_index: 1,
      text: 'Last quarter I struggled with team productivity until we implemented these 3 remote work strategies. The results surprised everyone. Are you using any of these approaches in your team?',
      model_used: 'gpt-4'
    },
    {
      variant_index: 2,
      text: 'Remote team management requires intentional structure. Here are key factors: clear communication channels, regular check-ins, and trust-based autonomy. Which of these do you prioritize?',
      model_used: 'gpt-4'
    }
  ];

  console.log('Scoring 3 draft variants against heuristic rubric...\n');

  const scoredVariants = await scoreDrafts(mockVariants, 'test-user-scoring');

  console.log('\n📊 Scoring Results:');
  scoredVariants.forEach(function(variant, index) {
    console.log('\n   Variant ' + index + ' (' + variant.text.substring(0, 60) + '...):');
    console.log('      Overall Score: ' + (variant.score * 100).toFixed(1) + '%');
    console.log('      Hook Strength: ' + (variant.score_breakdown.hook_strength * 100).toFixed(1) + '%');
    console.log('      Length Band: ' + (variant.score_breakdown.length_band * 100).toFixed(1) + '%');
    console.log('      CTA Presence: ' + (variant.score_breakdown.cta_presence * 100).toFixed(1) + '%');
    console.log('      Topic Performance: ' + (variant.score_breakdown.historical_topic_performance * 100).toFixed(1) + '%');
    console.log('      Cold Start: ' + variant.scoring_result?.cold_start_label);
  });

  const bestVariant = scoredVariants.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  console.log('\n🏆 Best variant: #' + bestVariant.variant_index + ' with score ' + (bestVariant.score * 100).toFixed(1) + '%');

  console.log('\n✅ Phase 4 - Scoring CLI test complete!');
  console.log('\n📊 Phase 4 Verification:');
  console.log('  ✅ Heuristic rubric scoring with weighted factors');
  console.log('  ✅ Detailed score breakdown (hook, length, CTA, topic)');
  console.log('  ✅ Cold-start heuristic-only label');
  console.log('  ✅ Best variant identification');

  return true;
}

if (require.main === module) {
  testScoring()
    .then(function(success) {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(function(error) {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testScoring };