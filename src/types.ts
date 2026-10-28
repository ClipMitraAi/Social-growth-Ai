export type PlatformType = 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'x_twitter';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PRO' | 'AGENCY';
}

export interface UsageQuota {
  id: string;
  userId: string;
  dateReset: string;
  auditCount: number;
  maxAudits: number;
  aiGenerationCount: number;
  maxAiGenerations: number;
  exportCount: number;
  maxExports: number;
}

export interface UserPreferences {
  defaultPlatform: string;
  contentNiche: string;
  targetAudience: string;
  preferredTone: string;
  language: string;
  emailNotifications: boolean;
  darkTheme: boolean;
}

export interface MetricValue<T = number> {
  value: T;
  isAvailable: boolean;
  statusNote?: string;
  source?: string;
}

export interface HistoricalDataPoint {
  date: string;
  followers: number;
  engagementRate: number;
  views?: number;
}

export interface GrowthAction {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  recommendation: string;
  actionableSteps: string[];
}

export interface ProfileAuditResult {
  handle: string;
  displayName: string;
  platform: PlatformType;
  profileUrl: string;
  avatarUrl: string;
  isVerified: boolean;
  isPrivate: boolean;
  bio: string;
  categoryOrNiche: string;
  metrics: {
    followers: MetricValue<number>;
    following: MetricValue<number>;
    postsCount: MetricValue<number>;
    totalViews: MetricValue<number>;
    avgLikes: MetricValue<number>;
    avgComments: MetricValue<number>;
    avgShares: MetricValue<number>;
    engagementRate: MetricValue<number> & { formula: string };
  };
  historicalTrend: HistoricalDataPoint[];
  contentInsights: {
    topPostTypes: Array<{ type: string; percentage: number; avgEngagement: number }>;
    bestPostingTimes: string[];
    topHashtags: Array<{ tag: string; avgEngagement: number }>;
    contentConsistencyScore: number;
    avgPostFrequencyPerWeek: number;
  };
  growthPlaybook: GrowthAction[];
  dataSource: string;
  isDemoMode: boolean;
  demoNotice?: string;
  lastUpdated: string;
}

export interface SavedProfile {
  id: string;
  userId: string;
  platform: PlatformType;
  handle: string;
  profileUrl: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
  notes?: string;
  tags: string[];
  lastAuditedAt: string;
  createdAt: string;
}

export interface ContentIdea {
  id: string;
  userId: string;
  platform: string;
  niche: string;
  topic: string;
  title: string;
  hook: string;
  script?: string;
  captions: string[];
  hashtags: string[];
  score: number;
  isFavorited: boolean;
  createdAt: string;
}

export interface CalendarEntry {
  id: string;
  userId: string;
  platform: string;
  scheduledTime: string;
  caption: string;
  hashtags: string[];
  mediaType: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  reminderSent: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedContentResult {
  captions: Array<{ label: string; text: string; characterCount: number }>;
  hashtags: {
    recommended: string[];
    highReach: string[];
    nicheSpecific: string[];
  };
  videoHooks: Array<{ type: string; hook: string; explanation: string }>;
  videoScript?: {
    duration: string;
    hook: string;
    bodyPoints: Array<{ timecode: string; visualCue: string; spokenAudio: string }>;
    callToAction: string;
  };
  thumbnailTitles?: Array<{ title: string; ctrScore: number; thumbnailVisualDescription: string }>;
  contentCalendarWeek?: Array<{
    day: string;
    suggestedTime: string;
    format: string;
    angle: string;
    sampleHook: string;
  }>;
  strategicImprovements: string[];
  providerUsed: string;
  isFallback: boolean;
}
