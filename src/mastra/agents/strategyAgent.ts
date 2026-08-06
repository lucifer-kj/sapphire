import { BrandProfile } from '@/types';

export interface StrategicAngle {
  angle_type: 'CONTROVERSIAL' | 'STORY' | 'FRAMEWORK';
  title: string;
  hook_idea: string;
  target_takeaway: string;
}

export async function generateStrategicAngles(
  rawIdea: string,
  brandProfile?: BrandProfile
): Promise<StrategicAngle[]> {
  const persona = brandProfile?.persona || 'Thought Leader in Tech';
  const tone = brandProfile?.tone || 'Professional & Data-driven';

  // Strategy Agent logic framing 3 distinct content angles
  const angles: StrategicAngle[] = [
    {
      angle_type: 'CONTROVERSIAL',
      title: 'Challenging Industry Norms',
      hook_idea: `Most people view "${rawIdea.slice(0, 30)}..." completely wrong. Here's why standard advice fails:`,
      target_takeaway: 'Reframe standard industry assumptions into a fresh, high-engagement counter-perspective.',
    },
    {
      angle_type: 'STORY',
      title: 'Lessons Learned & Personal Insight',
      hook_idea: `When we first tackled "${rawIdea.slice(0, 30)}...", we made a costly mistake that changed everything:`,
      target_takeaway: 'Share relatable experience to build authenticity and personal brand authority.',
    },
    {
      angle_type: 'FRAMEWORK',
      title: 'Step-by-Step Actionable Guide',
      hook_idea: `A 3-step framework to master "${rawIdea.slice(0, 30)}..." without wasting months:`,
      target_takeaway: 'Provide immediate tactical value that encourages bookmarks, saves, and reposts.',
    },
  ];

  return angles;
}
