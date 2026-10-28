import { BasePlatformAdapter } from './base.ts';
import { PlatformType, ProfileAuditResult } from './types.ts';
import { InstagramAdapter } from './instagram.ts';
import { YouTubeAdapter } from './youtube.ts';
import { TikTokAdapter } from './tiktok.ts';
import { FacebookAdapter } from './facebook.ts';
import { XTwitterAdapter } from './x_twitter.ts';

class PlatformRegistry {
  private adapters: Map<PlatformType, BasePlatformAdapter> = new Map();
  private auditCache: Map<string, { result: ProfileAuditResult; expiresAt: number }> = new Map();

  constructor() {
    this.register(new InstagramAdapter());
    this.register(new YouTubeAdapter());
    this.register(new TikTokAdapter());
    this.register(new FacebookAdapter());
    this.register(new XTwitterAdapter());
  }

  private register(adapter: BasePlatformAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }

  getAdapter(platform: PlatformType): BasePlatformAdapter {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`Platform adapter not supported: ${platform}`);
    }
    return adapter;
  }

  /**
   * Auto-detect platform and handle from a URL or raw string
   */
  detectPlatformAndHandle(input: string, fallbackPlatform: PlatformType = 'instagram'): { platform: PlatformType; handle: string } {
    const trimmed = input.trim().toLowerCase();
    
    if (trimmed.includes('instagram.com/')) {
      const adapter = this.getAdapter('instagram');
      return { platform: 'instagram', handle: adapter.extractHandle(input) };
    }
    if (trimmed.includes('youtube.com/') || trimmed.includes('youtu.be/')) {
      const adapter = this.getAdapter('youtube');
      return { platform: 'youtube', handle: adapter.extractHandle(input) };
    }
    if (trimmed.includes('tiktok.com/')) {
      const adapter = this.getAdapter('tiktok');
      return { platform: 'tiktok', handle: adapter.extractHandle(input) };
    }
    if (trimmed.includes('facebook.com/')) {
      const adapter = this.getAdapter('facebook');
      return { platform: 'facebook', handle: adapter.extractHandle(input) };
    }
    if (trimmed.includes('x.com/') || trimmed.includes('twitter.com/')) {
      const adapter = this.getAdapter('x_twitter');
      return { platform: 'x_twitter', handle: adapter.extractHandle(input) };
    }

    // Default to the provided fallback platform
    const adapter = this.getAdapter(fallbackPlatform);
    return { platform: fallbackPlatform, handle: adapter.extractHandle(input) };
  }

  /**
   * Performs audit with in-memory caching (5 minutes) and error handling
   */
  async audit(platform: PlatformType, handleOrUrl: string): Promise<ProfileAuditResult> {
    const adapter = this.getAdapter(platform);
    const cleanHandle = adapter.extractHandle(handleOrUrl);
    const cacheKey = `${platform}:${cleanHandle.toLowerCase()}`;

    const cached = this.auditCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const result = await adapter.auditProfile(cleanHandle);

    // Cache for 5 minutes
    this.auditCache.set(cacheKey, {
      result,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return result;
  }

  /**
   * Status for admin dashboard
   */
  getIntegrationsStatus() {
    return Array.from(this.adapters.values()).map((adapter) => ({
      platform: adapter.platform,
      displayName: adapter.platformDisplayName,
      officialApi: adapter.officialApiName,
      isConfigured: adapter.isApiConfigured(),
      mode: adapter.isApiConfigured() ? 'LIVE_API' : 'DEMO_SYNTHETIC',
      statusMessage: adapter.isApiConfigured()
        ? 'Connected to official API'
        : 'Running in safe demo mode with synthetic public baseline data',
    }));
  }
}

export const platformRegistry = new PlatformRegistry();
