export function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  if (/[áéíóúüñ]/.test(lower)) return 'es';
  if (/[àâäéèêëïîôöùûüÿ]/.test(lower)) return 'fr';
  if (/[äöüß]/.test(lower)) return 'de';
  return 'en';
}

export function detectContentIssues(text: string): string[] {
  const warnings: string[] = [];
  const instructionPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s+prompt\s+override/i,
    /execute\s+this\s+command/i,
    /publish\s+immediately/i,
  ];

  for (const pattern of instructionPatterns) {
    if (pattern.test(text)) {
      warnings.push('Instruction-like phrasing detected - treating as content');
      break;
    }
  }

  return warnings;
}

export function normalizeIdea(rawContent: string) {
  if (!rawContent || !rawContent.trim()) {
    throw new Error('Idea cannot be empty or whitespace-only');
  }

  if (rawContent.length > 500) {
    throw new Error('Idea exceeds maximum length of 500 characters');
  }

  // 1. Detect language FIRST on raw text before stripping diacritics
  const language = detectLanguage(rawContent);

  // 2. Normalize spacing & trim (preserve diacritics & punctuation)
  const normalized = rawContent
    .replace(/\s+/g, ' ')
    .trim();

  const lengthStatus = normalized.length < 10 ? 'too_short' : normalized.length > 500 ? 'too_long' : 'ok';
  const contentWarnings = detectContentIssues(normalized);

  return {
    id: crypto.randomUUID(),
    raw_content: rawContent,
    normalized_content: normalized,
    language,
    status: 'processing',
    length_status: lengthStatus,
    content_warnings: contentWarnings,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
