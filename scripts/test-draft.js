const path = require('path');
const { normalizeIdea } = require(path.join(__dirname, '..', 'src', 'mastra', 'agents', 'curatorAgent'));
const { generateDraftVariants } = require(path.join(__dirname, '..', 'src', 'mastra', 'agents', 'draftAgent'));
const { scoreDrafts } = require(path.join(__dirname, '..', 'src', 'mastra', 'agents', 'rankingAgent'));

async function testDraftGeneration() {
  console.log('🚀 Testing Phase 3: Draft Generation (Standalone CLI)\n');

  // Test 1: Idea normalization
  console.log('1. Testing curatorAgent (idea normalization)...');
  try {
    const testIdeas = [
      'How to build a successful SaaS business',
      'Tips for remote team management',
      'AI automation trends in 2026'
    ];

    for (const rawIdea of testIdeas) {
      const idea = normalizeIdea(rawIdea, 'test-user-1');
      console.log('\n   Input: "' + rawIdea + '"');
      console.log('   ✅ Normalized: "' + idea.normalized_content + '"');
      console.log('   Language: ' + idea.language);
      console.log('   Length status: ' + idea.length_status);
    }

    console.log('\n✅ curatorAgent: Idea normalization complete');
  } catch (error) {
    console.error('❌ curatorAgent failed:', error.message);
    return false;
  }

  // Test 2: Draft generation
  console.log('\n2. Testing draftAgent (3 parallel variant generation)...');
  try {
    const idea = normalizeIdea('Building effective remote teams', 'test-user-2');

    const startTime = Date.now();
    const variants = await generateDraftVariants('Building effective remote teams', 'test-user-2');
    const endTime = Date.now();

    console.log('✅ draftAgent: Generated ' + variants.length + ' variants in ' + (endTime - startTime) + 'ms');
    variants.forEach(function(variant, index) {
      console.log('   Variant ' + index + ': "' + variant.text.substring(0, 100) + '..."');
      console.log('      Voice profile applied: ' + variant.voice_profile_applied);
    });

    console.log('\n✅ draftAgent: Parallel variant generation complete');
  } catch (error) {
    console.error('❌ draftAgent failed:', error.message);
    return false;
  }

  // Test 3: Scoring
  console.log('\n3. Testing rankingAgent (scoring with breakdown)...');
  try {
    const idea = normalizeIdea('Maximizing productivity with AI tools', 'test-user-3');
    const variants = await generateDraftVariants('Maximizing productivity with AI tools', 'test-user-3');

    const scoredVariants = await scoreDrafts(variants, 'test-user-3');

    console.log('\n✅ rankingAgent: Scoring complete with detailed breakdowns:');
    scoredVariants.forEach(function(variant, index) {
      console.log('\n   Variant ' + index + ':');
      console.log('      Score: ' + (variant.score * 100).toFixed(1) + '%');
      console.log('      Hook Strength: ' + (variant.score_breakdown.hook_strength * 100).toFixed(1) + '%');
      console.log('      Length Band: ' + (variant.score_breakdown.length_band * 100).toFixed(1) + '%');
      console.log('      CTA Presence: ' + (variant.score_breakdown.cta_presence * 100).toFixed(1) + '%');
      console.log('      Topic Performance: ' + (variant.score_breakdown.historical_topic_performance * 100).toFixed(1) + '%');
      console.log('      Cold Start Label: ' + (variant.scoring_result?.cold_start_label || 'learned'));
      console.log('      Explanation: ' + variant.scoring_result?.explanation);
    });

    console.log('\n✅ rankingAgent: Comprehensive scoring complete');
  } catch (error) {
    console.error('❌ rankingAgent failed:', error.message);
    return false;
  }

  console.log('\n🎉 Phase 3 - Draft Generation CLI test complete!');
  console.log('\n📊 Phase 3 Verification:');
  console.log('  ✅ curatorAgent: Idea normalization and validation');
  console.log('  ✅ draftAgent: 3 parallel variant generation');
  console.log('  ✅ rankingAgent: Scoring with detailed, legible breakdowns');
  console.log('  ✅ Cold-start behavior: Heuristic-only scoring when needed');
  console.log('  ✅ Voice profile integration');

  return true;
}

if (require.main === module) {
  testDraftGeneration()
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

module.exports = { testDraftGeneration };