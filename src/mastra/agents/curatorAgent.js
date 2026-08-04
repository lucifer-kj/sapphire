const agentState = new Map();

function normalizeIdea(rawContent, userId) {
  if (!rawContent || !rawContent.trim()) {
    throw new Error('Idea cannot be empty or whitespace-only');
  }

  if (rawContent.length > 500) {
    throw new Error('Idea exceeds maximum length of 500 characters');
  }

  const normalized = rawContent
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-]/g, '')
    .trim();

  const language = detectLanguage(normalized);
  const lengthStatus = normalized.length < 10 ? 'too_short' : normalized.length > 500 ? 'too_long' : 'ok';
  const contentWarnings = detectContentIssues(normalized);

  const idea = {
    id: crypto.randomUUID(),
    raw_content: rawContent,
    normalized_content: normalized,
    language,
    status: 'processing',
    length_status: lengthStatus,
    content_warnings: contentWarnings,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  agentState.set(userId, idea);
  return idea;
}

function detectLanguage(text) {
  if (/[áéíóúüñ]/.test(text)) return 'es';
  if (/[àâäéèêëïîôöùûüÿ]/.test(text)) return 'fr';
  if (/[äöüß]/.test(text)) return 'de';
  return 'en';
}

function detectContentIssues(text) {
  const warnings = [];
  const instructionPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s+prompt\s+override/i,
    /execute\s+this\s+command/i,
    /publish\s+immediately/i
  ];

  for (const pattern of instructionPatterns) {
    if (pattern.test(text)) {
      warnings.push('Instruction-like phrasing detected - treating as content');
      break;
    }
  }

  return warnings;
}

function getIdeaFromState(userId) {
  return agentState.get(userId);
}

module.exports = { normalizeIdea, getIdeaFromState, detectLanguage, detectContentIssues };