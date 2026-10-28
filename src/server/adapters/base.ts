import { PlatformType, ProfileAuditResult, GrowthAction } from './types.ts';

export abstract class BasePlatformAdapter {
  abstract readonly platform: PlatformType;
  abstract readonly platformDisplayName: string;
  abstract readonly officialApiName: string;

  /**
   * Cleans and extracts pure handle from string or URL
   */
  abstract extractHandle(input: string): string;

  /**
   * Validates if input conforms to platform handle rules
   */
  abstract validateHandle(handle: string): { isValid: boolean; error?: string };

  /**
   * Fetches profile audit. If real credentials exist in process.env, uses authorized API.
   * Otherwise falls back gracefully to clearly labeled Demo Mode with synthetic realistic data.
   */
  abstract auditProfile(handleOrUrl: string): Promise<ProfileAuditResult>;

  /**
   * Checks if official API credentials exist for this platform in env
   */
  abstract isApiConfigured(): boolean;

  /**
   * Helper to clean common URL parameters and leading '@'
   */
  protected sanitizeRawHandle(raw: string): string {
    let clean = raw.trim();
    // Remove query params or hash
    clean = clean.split('?')[0].split('#')[0];
    // Remove trailing slashes
    clean = clean.replace(/\/+$/, '');
    // Remove leading '@'
    clean = clean.replace(/^@+/, '');
    return clean;
  }

  /**
   * Generates deterministic hash number from a string
   */
  protected stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * Generates legitimate, personalized organic growth playbook
   */
  protected generateOrganicRecommendations(
    platform: PlatformType,
    handle: string,
    followers: number,
    engagementRate: number,
    postFrequency: number
  ): GrowthAction[] {
    const actions: GrowthAction[] = [];

    // Engagement strategy
    if (engagementRate < 2.0) {
      actions.push({
        category: 'Audience Retention',
        priority: 'high',
        title: 'Improve Early 3-Second Retention & Hook Depth',
        recommendation: `Your engagement rate is ${engagementRate}%, which is below the 2.5% platform median. Focus on first-frame visual contrast and provocative problem-first questions.`,
        actionableSteps: [
          'Replace generic text introductions with an unexpected opening frame or tension statement.',
          'Respond to all comments within the first 60 minutes of posting to stimulate platform re-distribution.',
          'Test shorter 20-35 second videos with an audio loop hook.',
        ],
      });
    } else {
      actions.push({
        category: 'Audience Retention',
        priority: 'medium',
        title: 'Capitalize on High Engagement with Micro-Communities',
        recommendation: `Your engagement rate of ${engagementRate}% shows strong affinity. Deepen loyalty by turning passive viewers into vocal advocates.`,
        actionableSteps: [
          'Run weekly Q&A carousels highlighting specific follower questions.',
          'Pin the most insightful community comment to set the conversation tone.',
          'Create a recognizable recurring weekly series or catchphrase.',
        ],
      });
    }

    // Consistency / Post Frequency
    if (postFrequency < 3) {
      actions.push({
        category: 'Posting Schedule',
        priority: 'high',
        title: 'Increase Weekly Publishing Cadence',
        recommendation: `Currently averaging ~${postFrequency} posts/week. Platform discovery algorithms heavily reward 4 to 6 focused touchpoints per week.`,
        actionableSteps: [
          'Batch produce 6 pieces of content in a single weekly 2-hour production session.',
          'Repurpose top-performing long-form ideas into 3 quick standalone carousels or shorts.',
          'Use the built-in Content Calendar to schedule posts during peak hours (11:00 AM - 2:00 PM & 6:00 PM - 9:00 PM).',
        ],
      });
    } else {
      actions.push({
        category: 'Posting Schedule',
        priority: 'low',
        title: 'Optimize Distribution Timing & Content Batches',
        recommendation: `Your posting consistency of ${postFrequency} posts/week is excellent. Maintain cadence while timing posts around audience active windows.`,
        actionableSteps: [
          'Analyze follower active hours in analytics and schedule 15 minutes before peak surges.',
          'Do not double-post within a 4-hour window to avoid competing for reach.',
        ],
      });
    }

    // Platform Specific SEO & Discoverability
    if (platform === 'youtube') {
      actions.push({
        category: 'Content Strategy',
        priority: 'high',
        title: 'Title CTR & A/B Thumbnail Testing',
        recommendation: 'YouTube search and suggested video algorithms prioritize Click-Through Rate (CTR) and Average View Duration (AVD).',
        actionableSteps: [
          'Keep titles under 55 characters so they never truncate on mobile screens.',
          'Use high-contrast faces or focal subjects with minimal, readable text (under 4 words) in thumbnails.',
          'Add keyword-rich chapters/timestamps to improve Google Search video indexation.',
        ],
      });
    } else if (platform === 'instagram') {
      actions.push({
        category: 'Hashtags & SEO',
        priority: 'medium',
        title: 'Transition from Broad Hashtags to Semantic In-Caption SEO',
        recommendation: 'Instagram Explore now prioritizes semantic keywords in your audio transcription and caption over mega-hashtags with 10M+ posts.',
        actionableSteps: [
          'Use 3-5 hyper-specific niche hashtags instead of 30 generic tags like #love or #instagood.',
          'Include 3 key search queries naturally in the first two sentences of your caption.',
          'Always turn on auto-generated closed captions for reels.',
        ],
      });
    } else if (platform === 'tiktok') {
      actions.push({
        category: 'Content Strategy',
        priority: 'high',
        title: 'Trending Sound Adaptation & Text Overlays',
        recommendation: 'TikTok algorithms measure retention milestones at 1s, 3s, and completion. Fast on-screen text overlays increase watch time by 32%.',
        actionableSteps: [
          'Keep the opening visual hook under 1.5 seconds before any speaking pauses.',
          'Pair educational points with trending commercial audio at low background volume (10%).',
          'Use TikTok native text font overlays to trigger search indexing.',
        ],
      });
    } else if (platform === 'x_twitter') {
      actions.push({
        category: 'Content Strategy',
        priority: 'high',
        title: 'High-Value Curated Threads & Quotable Insights',
        recommendation: 'X algorithm heavily weights bookmarks, replies, and quotation reposts over basic likes.',
        actionableSteps: [
          'Lead threads with a counter-intuitive finding or quantifiable case study.',
          'Structure each post with clear line breaks and zero filler words.',
          'Prompt constructive debate at the end with an open question rather than a statement.',
        ],
      });
    } else {
      actions.push({
        category: 'Content Strategy',
        priority: 'medium',
        title: 'Cross-Platform Community Building',
        recommendation: 'Focus on native video uploads and engaging directly in comment discussions.',
        actionableSteps: [
          'Upload native video rather than external links to maximize algorithm feed score.',
          'Pin community announcements and high-impact educational resources.',
        ],
      });
    }

    return actions;
  }
}
