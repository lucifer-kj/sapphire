export async function validatePostForPublishing(text: string, platform: string) {
  if (!text || !text.trim()) {
    return { valid: false, error: 'Post content cannot be empty' };
  }

  const maxLengths: Record<string, number> = {
    linkedin: 3000,
    twitter: 280,
    instagram: 2200,
  };

  const maxLen = maxLengths[platform.toLowerCase()] || 3000;

  if (text.length > maxLen) {
    return { valid: false, error: `Post content exceeds ${platform} limit of ${maxLen} characters` };
  }

  return { valid: true };
}
