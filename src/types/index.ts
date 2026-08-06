export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}

export interface BrandProfile {
  workspace_id: string;
  company_name?: string;
  persona: string;
  tone: string;
  topics: string[];
  example_posts: string[];
  updated_at: string;
}

export interface Idea {
  id: string;
  workspace_id: string;
  author_id: string;
  raw_content: string;
  normalized_content?: string;
  image_url?: string;
  language: string;
  status: 'new' | 'processing' | 'drafted' | 'discarded';
  created_at: string;
  updated_at: string;
}

export interface DraftVariant {
  id?: string;
  workspace_id?: string;
  idea_id?: string;
  platform?: string;
  variant_index: number;
  text: string;
  score: number;
  angle_type?: 'CONTROVERSIAL' | 'STORY' | 'FRAMEWORK';
  score_breakdown?: {
    hook_strength?: number;
    length_band?: number;
    cta_presence?: number;
    historical_topic_performance?: number;
    hook_rationale?: string;
    cta_rationale?: string;
    overall_rationale?: string;
    [key: string]: number | string | undefined;
  };
  policy_flags?: Record<string, unknown>;
  model_used?: string;
  created_at?: string;
}

export interface WorkflowRun {
  runId: string;
  ideaId?: string;
  ideaTitle?: string;
  state: 'running' | 'suspended' | 'completed' | 'failed' | 'regenerating';
  scoredVariants?: DraftVariant[];
  suspendedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface Post {
  id: string;
  workspace_id: string;
  draft_id?: string;
  platform: 'linkedin' | 'instagram' | 'twitter';
  final_text: string;
  image_url?: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  scheduled_for?: string;
  published_at?: string;
  linkedin_post_urn?: string;
  external_post_urn?: string;
  retry_count?: number;
  last_error?: string;
  version?: number;
  created_at: string;
  updated_at: string;
  likes?: number;
  comments?: number;
  reposts?: number;
  manually_posted?: boolean;
  manual_note?: string;
}


export interface SocialAccount {
  id: string;
  workspace_id: string;
  platform: 'linkedin' | 'instagram' | 'twitter';
  account_name?: string;
  token_expires_at: string;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

export interface ContentJob {
  id: string;
  workspace_id: string;
  idea_id?: string;
  n8n_job_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_data?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface EngagementSnapshot {
  id: string;
  post_id: string;
  workspace_id: string;
  platform: 'linkedin' | 'instagram' | 'twitter';
  likes: number;
  comments: number;
  reposts: number;
  engagement_rate: number;
  snapshot_at: string;
}

export interface RubricWeights {
  workspace_id: string;
  hook_weight: number;
  length_weight: number;
  cta_weight: number;
  topic_weight: number;
  updated_at: string;
}

