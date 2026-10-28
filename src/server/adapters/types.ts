export type PlatformType = 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'x_twitter';

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

export interface ContentTypeStat {
  type: string;
  percentage: number;
  avgEngagement: number;
}

export interface HashtagStat {
  tag: string;
  avgEngagement: number;
}

export interface GrowthAction {
  category: 'Content Strategy' | 'Audience Retention' | 'Posting Schedule' | 'Hashtags & SEO' | 'Conversion';
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
    topPostTypes: ContentTypeStat[];
    bestPostingTimes: string[];
    topHashtags: HashtagStat[];
    contentConsistencyScore: number; // 0-100
    avgPostFrequencyPerWeek: number;
  };
  growthPlaybook: GrowthAction[];
  dataSource: string;
  isDemoMode: boolean;
  demoNotice?: string;
  lastUpdated: string;
}

export interface PlatformConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  isConfigured: boolean;
  rateLimitRemaining: number;
  rateLimitReset: string;
}
