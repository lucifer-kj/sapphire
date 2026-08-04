const { normalizeIdea } = require('./curatorAgent');

const agentState = new Map();

const VOICE_PROFILE_DEFAULTS = {
  tone_preference: 'professional',
  length_preference: 'medium',
  emoji_usage: 'low',
  question_usage: 'high',
  past_edits: []
};

async function generateDraftVariants(rawIdea, userId) {
  const idea = normalizeIdea(rawIdea, userId);
  const voiceProfile = getVoiceProfile(userId);

  const variants = await Promise.all([
    generateVariant(idea, voiceProfile, 0, 'HOOK-FOCUSED'),
    generateVariant(idea, voiceProfile, 1, 'STORY-BASED'),
    generateVariant(idea, voiceProfile, 2, 'LIST/HYBRID')
  ]);

  agentState.set(userId, variants);
  return variants;
}

async function generateVariant(idea, voiceProfile, index, variantType) {
  const prompt = buildPrompt(idea, voiceProfile, variantType);

  const variant = {
    variant_index: index,
    text: `[Simulated ${variantType} variant for: "${idea.normalized_content.substring(0, 50)}..."]`,
    voice_profile_applied: `Tone: ${voiceProfile.tone_preference}, Length: ${voiceProfile.length_preference}, Emoji: ${voiceProfile.emoji_usage}, Questions: ${voiceProfile.question_usage}`,
    model_used: 'gpt-4',
    generation_time_ms: 0,
    created_at: new Date().toISOString(),
    id: crypto.randomUUID()
  };

  return variant;
}

function buildPrompt(idea, voiceProfile, variantType) {
  const voiceInstruction = voiceProfile
    ? `Voice Profile Adaptations:\n- Tone: ${voiceProfile.tone_preference}\n- Length: ${voiceProfile.length_preference}\n- Emoji Usage: ${voiceProfile.emoji_usage}\n- Question Usage: ${voiceProfile.question_usage}`
    : '';

  return `
Generate a LinkedIn content draft variant based on this idea:

IDEA: "${idea.normalized_content}"
LANGUAGE: ${idea.language}
VARIANT TYPE: ${variantType}

${voiceInstruction}

Requirements:
1. Write in clear, professional LinkedIn tone
2. Include relevant hashtags (2-3)
3. End with a call-to-action question
4. Medium length (3-4 sentences)
5. Low emoji usage
6. Include questions for engagement

Generated content:`;
}

function getVoiceProfile(userId) {
  const existing = agentState.get(`${userId}_voice_profile`);
  if (existing) return existing;

  const defaultProfile = { ...VOICE_PROFILE_DEFAULTS };
  agentState.set(`${userId}_voice_profile`, defaultProfile);
  return defaultProfile;
}

function getDraftVariantsFromState(userId) {
  return agentState.get(userId);
}

module.exports = { generateDraftVariants, getDraftVariantsFromState, getVoiceProfile };