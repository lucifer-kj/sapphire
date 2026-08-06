import { DraftVariant } from '@/types';


export interface WorkflowResult {
  runId: string;
  state: 'running' | 'suspended' | 'completed' | 'failed' | 'blocked';
  ideaId?: string;
  scoredVariants?: DraftVariant[];
  flags?: Array<{ variantIndex: number; type: string; message: string }>;
  error?: string;
}

export function runPolicyCheck(scoredVariants: DraftVariant[]) {
  const flags: Array<{ variantIndex: number; type: string; message: string }> = [];
  let passed = true;

  for (const variant of scoredVariants) {
    const text = variant.text;

    if (text.length > 3000) {
      flags.push({ variantIndex: variant.variant_index, type: 'length', message: 'Draft exceeds 3000 characters' });
      passed = false;
    }

    const hashtagCount = (text.match(/#/g) || []).length;
    if (hashtagCount > 8) {
      flags.push({ variantIndex: variant.variant_index, type: 'hashtags', message: 'Excessive hashtags (more than 8)' });
      passed = false;
    }

    const bannedPhrases = ['buy now', 'click here', 'act now'];
    for (const phrase of bannedPhrases) {
      if (text.toLowerCase().includes(phrase)) {
        flags.push({ variantIndex: variant.variant_index, type: 'banned_phrase', message: `Contains banned phrase: "${phrase}"` });
        passed = false;
        break;
      }
    }
  }

  return { passed, flags };
}
