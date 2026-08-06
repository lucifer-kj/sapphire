import { createAdminClient } from '@/lib/supabase/server';

export interface ImageGenerationOptions {
  workspaceId: string;
  postId?: string;
  approvedText: string;
  brandStyle?: string;
}

export function buildStructuredImagePrompt(approvedText: string, brandStyle?: string): string {
  const subject = approvedText.slice(0, 100).replace(/\n/g, ' ').trim();
  const style = brandStyle || 'Modern minimalist technology aesthetic, vibrant gradient accents, sleek dark mode backdrop';

  const prompt = [
    `Subject: Visual representation of core theme: "${subject}"`,
    `Style: ${style}`,
    `Composition: Square 1:1 aspect ratio, centered hero object, high visual impact, clean typography composition`,
    `Negative constraints: Do not include typos, gibberish text artifacts, stock photo watermarks, distorted hands or faces, blurry low resolution.`,
  ].join('\n');

  return prompt;
}

export async function generateAndStoreImage(options: ImageGenerationOptions): Promise<{ imageUrl: string; prompt: string }> {
  const { workspaceId, approvedText, brandStyle } = options;
  const prompt = buildStructuredImagePrompt(approvedText, brandStyle);
  const apiKey = process.env.GEMINI_API_KEY;

  let imageBuffer: Buffer | null = null;
  let mimeType = 'image/png';

  if (apiKey) {
    try {
      // Try Imagen / Gemini image model call
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '1:1', outputMimeType: 'image/png' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const base64Bytes = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64Bytes) {
          imageBuffer = Buffer.from(base64Bytes, 'base64');
        }
      }
    } catch (err) {
      console.warn('Gemini Imagen API call failed, generating fallback graphic:', err);
    }
  }

  // Fallback graphic generation if Imagen API unavailable
  if (!imageBuffer) {
    const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="50%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#g)"/>
      <circle cx="400" cy="400" r="220" fill="none" stroke="#60A5FA" stroke-width="4" opacity="0.4"/>
      <circle cx="400" cy="400" r="160" fill="none" stroke="#93C5FD" stroke-width="2" opacity="0.6"/>
      <text x="400" y="390" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#F8FAFC" text-anchor="middle">SAPPHIRE AI OS</text>
      <text x="400" y="430" font-family="system-ui, sans-serif" font-size="18" fill="#94A3B8" text-anchor="middle">${approvedText.slice(0, 35)}...</text>
    </svg>`;
    imageBuffer = Buffer.from(svg);
    mimeType = 'image/svg+xml';
  }

  // Upload to Supabase Storage bucket 'post-images'
  const fileName = `${workspaceId}/${Date.now()}.${mimeType === 'image/svg+xml' ? 'svg' : 'png'}`;
  let publicUrl = '';

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from('post-images')
      .upload(fileName, imageBuffer, { contentType: mimeType, upsert: true });

    if (!error) {
      const { data: publicData } = supabase.storage.from('post-images').getPublicUrl(fileName);
      publicUrl = publicData.publicUrl;
    }
  } catch (err) {
    console.warn('Supabase storage upload error:', err);
  }

  if (!publicUrl) {
    // Data URL fallback if storage bucket not configured yet
    publicUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  }

  return { imageUrl: publicUrl, prompt };
}
