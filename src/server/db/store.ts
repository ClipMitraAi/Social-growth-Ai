import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PRO' | 'AGENCY';
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  platform: string;
  platformUserId: string;
  handle: string;
  profileUrl?: string;
  avatarUrl?: string;
  status: 'active' | 'revoked' | 'expired';
  lastSyncedAt?: string;
  createdAt: string;
}

export interface SavedProfile {
  id: string;
  userId: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'x_twitter';
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
  updatedAt?: string;
}

export interface AnalyticsSnapshot {
  id: string;
  profileId: string;
  platform: string;
  handle: string;
  recordedAt: string;
  period: 'daily' | 'weekly' | 'monthly';
  followers: number;
  views?: number;
  likes?: number;
  comments?: number;
  engagementRate: number;
  metricsJson: Record<string, any>;
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

export interface UserPreference {
  id: string;
  userId: string;
  defaultPlatform: string;
  contentNiche: string;
  targetAudience: string;
  preferredTone: string;
  language: string;
  emailNotifications: boolean;
  darkTheme: boolean;
  updatedAt: string;
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
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  status: 'success' | 'failed' | 'throttled';
  details?: Record<string, any>;
  timestamp: string;
}

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  connectedAccounts: ConnectedAccount[];
  savedProfiles: SavedProfile[];
  analyticsSnapshots: AnalyticsSnapshot[];
  contentIdeas: ContentIdea[];
  calendarEntries: CalendarEntry[];
  userPreferences: UserPreference[];
  usageQuotas: UsageQuota[];
  auditEvents: AuditEvent[];
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, key] = combined.split(':');
    if (!salt || !key) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

class DatabaseStore {
  private data: DatabaseSchema;
  private dbFilePath: string;

  constructor() {
    const dataDir = path.resolve(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // ignore
      }
    }
    this.dbFilePath = path.join(dataDir, 'db.json');
    this.data = this.load();
    if (this.data.users.length === 0) {
      this.seedInitialData();
    }
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('Failed to parse db.json, initializing fresh store', err);
      }
    }
    return {
      users: [],
      sessions: [],
      connectedAccounts: [],
      savedProfiles: [],
      analyticsSnapshots: [],
      contentIdeas: [],
      calendarEntries: [],
      userPreferences: [],
      usageQuotas: [],
      auditEvents: [],
    };
  }

  private persist(): void {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  private seedInitialData(): void {
    const now = new Date().toISOString();
    
    // Seed Admin User
    const adminUser: User = {
      id: 'usr_admin_001',
      email: 'admin@socialgrowth.ai',
      name: 'Elena Vance (Admin)',
      passwordHash: hashPassword('AdminPass123!'),
      role: 'ADMIN',
      tier: 'AGENCY',
      createdAt: now,
      updatedAt: now,
    };

    // Seed Demo User
    const demoUser: User = {
      id: 'usr_demo_002',
      email: 'creator@socialgrowth.ai',
      name: 'Alex Rivera (Creator)',
      passwordHash: hashPassword('CreatorDemo123!'),
      role: 'USER',
      tier: 'PRO',
      createdAt: now,
      updatedAt: now,
    };

    this.data.users = [adminUser, demoUser];

    // Seed User Quotas
    this.data.usageQuotas = [
      {
        id: 'q_admin_001',
        userId: adminUser.id,
        dateReset: now,
        auditCount: 2,
        maxAudits: 500,
        aiGenerationCount: 4,
        maxAiGenerations: 500,
        exportCount: 0,
        maxExports: 100,
        updatedAt: now,
      },
      {
        id: 'q_demo_002',
        userId: demoUser.id,
        dateReset: now,
        auditCount: 3,
        maxAudits: 50,
        aiGenerationCount: 6,
        maxAiGenerations: 50,
        exportCount: 1,
        maxExports: 10,
        updatedAt: now,
      },
    ];

    // Seed User Preferences
    this.data.userPreferences = [
      {
        id: 'pref_demo_002',
        userId: demoUser.id,
        defaultPlatform: 'instagram',
        contentNiche: 'Tech & AI Insights',
        targetAudience: 'Software engineers, designers, startup founders',
        preferredTone: 'Authoritative, engaging, high-energy',
        language: 'en',
        emailNotifications: true,
        darkTheme: true,
        updatedAt: now,
      },
    ];

    // Seed Saved Profiles
    this.data.savedProfiles = [
      {
        id: 'prof_ig_veritas',
        userId: demoUser.id,
        platform: 'instagram',
        handle: 'natgeo',
        profileUrl: 'https://www.instagram.com/natgeo',
        displayName: 'National Geographic',
        avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
        bio: 'Inspiring people to care about the planet since 1888.',
        followersCount: 283400000,
        followingCount: 142,
        postsCount: 28940,
        engagementRate: 1.84,
        notes: 'Industry benchmark for visual storytelling and carousel reach.',
        tags: ['Benchmark', 'Photography', 'Nature'],
        lastAuditedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prof_yt_mkbhd',
        userId: demoUser.id,
        platform: 'youtube',
        handle: 'mkbhd',
        profileUrl: 'https://www.youtube.com/@mkbhd',
        displayName: 'Marques Brownlee',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Quality Tech Videos | YouTuber | Geek | Consumer Electronics',
        followersCount: 18500000,
        followingCount: 0,
        postsCount: 1680,
        engagementRate: 3.42,
        notes: 'Gold standard for YouTube titles, thumbnails, and retention.',
        tags: ['Tech', 'Competitor', 'YouTube'],
        lastAuditedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Seed Calendar Entries
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const twoDaysLater = new Date(Date.now() + 172800000).toISOString();

    this.data.calendarEntries = [
      {
        id: 'cal_entry_1',
        userId: demoUser.id,
        platform: 'instagram',
        scheduledTime: tomorrow,
        caption: '3 AI tools that will save you 15 hours every week as a developer. Bookmark this before you start your next sprint! 🚀',
        hashtags: ['#ai', '#developer', '#productivity', '#techtools', '#buildinpublic'],
        mediaType: 'carousel',
        status: 'SCHEDULED',
        reminderSent: false,
        notes: 'Slides 1-5 designed in Figma. Emphasize step 2.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cal_entry_2',
        userId: demoUser.id,
        platform: 'youtube',
        scheduledTime: twoDaysLater,
        caption: 'Full Breakdown: Why 90% of Social Media Algorithms Changed in 2026 and How to Adapt Organically.',
        hashtags: ['#youtubecreators', '#algorithm', '#socialgrowth'],
        mediaType: 'video',
        status: 'DRAFT',
        reminderSent: false,
        notes: 'Record intro hook with dual camera setup.',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Seed Content Ideas
    this.data.contentIdeas = [
      {
        id: 'idea_1',
        userId: demoUser.id,
        platform: 'instagram',
        niche: 'AI & SaaS Growth',
        topic: 'How to gain your first 1,000 real followers without paying for ads',
        title: 'The Organic Playbook: 0 to 1,000 Engaged Followers',
        hook: 'Stop buying ads for a dead account. Here is the exact organic formula that works in 2026.',
        script: 'Hook (0-3s): Show analytics screen. Body (3-25s): 1. Value-first carousels. 2. Replying to niche peers within 15 mins. 3. Re-hooking existing posts. CTA (25-30s): Comment "GROWTH" for the checklist.',
        captions: ['Organic growth is not dead—it just requires higher signal-to-noise ratio.'],
        hashtags: ['#organicgrowth', '#socialmediatips', '#contentstrategy'],
        score: 94,
        isFavorited: true,
        createdAt: now,
      },
    ];

    // Seed Initial Audit Event
    this.data.auditEvents = [
      {
        id: 'audit_init',
        userId: adminUser.id,
        action: 'SYSTEM_BOOT',
        resource: 'system',
        ipAddress: '127.0.0.1',
        status: 'success',
        details: { version: '1.0.0', initialized: true },
        timestamp: now,
      },
    ];

    this.persist();
  }

  // --- Users ---
  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(params: { email: string; name: string; passwordHash: string; role?: 'USER' | 'ADMIN'; tier?: 'FREE' | 'PRO' | 'AGENCY' }): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      email: params.email.toLowerCase(),
      name: params.name,
      passwordHash: params.passwordHash,
      role: params.role || 'USER',
      tier: params.tier || 'FREE',
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(newUser);

    // Create default quota
    const quota: UsageQuota = {
      id: `q_${crypto.randomBytes(8).toString('hex')}`,
      userId: newUser.id,
      dateReset: now,
      auditCount: 0,
      maxAudits: newUser.tier === 'FREE' ? 10 : 50,
      aiGenerationCount: 0,
      maxAiGenerations: newUser.tier === 'FREE' ? 15 : 100,
      exportCount: 0,
      maxExports: newUser.tier === 'FREE' ? 3 : 25,
      updatedAt: now,
    };
    this.data.usageQuotas.push(quota);

    // Create default preference
    const pref: UserPreference = {
      id: `pref_${crypto.randomBytes(8).toString('hex')}`,
      userId: newUser.id,
      defaultPlatform: 'instagram',
      contentNiche: 'General Growth',
      targetAudience: 'Content creators & enthusiasts',
      preferredTone: 'Engaging, informative',
      language: 'en',
      emailNotifications: true,
      darkTheme: true,
      updatedAt: now,
    };
    this.data.userPreferences.push(pref);

    this.persist();
    return newUser;
  }

  deleteUser(userId: string): boolean {
    const idx = this.data.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
    this.data.savedProfiles = this.data.savedProfiles.filter((p) => p.userId !== userId);
    this.data.contentIdeas = this.data.contentIdeas.filter((i) => i.userId !== userId);
    this.data.calendarEntries = this.data.calendarEntries.filter((c) => c.userId !== userId);
    this.data.userPreferences = this.data.userPreferences.filter((p) => p.userId !== userId);
    this.data.usageQuotas = this.data.usageQuotas.filter((q) => q.userId !== userId);
    this.persist();
    return true;
  }

  // --- Sessions ---
  createSession(userId: string, ipAddress?: string, userAgent?: string): Session {
    const session: Session = {
      id: `sess_${crypto.randomBytes(8).toString('hex')}`,
      token: crypto.randomBytes(32).toString('hex'),
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    };
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  getSessionByToken(token: string): Session | undefined {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.persist();
  }

  // --- Quotas ---
  getQuota(userId: string): UsageQuota {
    let quota = this.data.usageQuotas.find((q) => q.userId === userId);
    const now = new Date();
    if (!quota) {
      quota = {
        id: `q_${crypto.randomBytes(8).toString('hex')}`,
        userId,
        dateReset: now.toISOString(),
        auditCount: 0,
        maxAudits: 10,
        aiGenerationCount: 0,
        maxAiGenerations: 15,
        exportCount: 0,
        maxExports: 3,
        updatedAt: now.toISOString(),
      };
      this.data.usageQuotas.push(quota);
      this.persist();
      return quota;
    }

    // Daily reset check (if reset date is from previous calendar day)
    const resetDate = new Date(quota.dateReset);
    if (now.getUTCDate() !== resetDate.getUTCDate() || now.getUTCMonth() !== resetDate.getUTCMonth()) {
      quota.auditCount = 0;
      quota.aiGenerationCount = 0;
      quota.exportCount = 0;
      quota.dateReset = now.toISOString();
      quota.updatedAt = now.toISOString();
      this.persist();
    }
    return quota;
  }

  incrementQuota(userId: string, type: 'audit' | 'ai' | 'export'): { allowed: boolean; quota: UsageQuota } {
    const quota = this.getQuota(userId);
    if (type === 'audit') {
      if (quota.auditCount >= quota.maxAudits) return { allowed: false, quota };
      quota.auditCount += 1;
    } else if (type === 'ai') {
      if (quota.aiGenerationCount >= quota.maxAiGenerations) return { allowed: false, quota };
      quota.aiGenerationCount += 1;
    } else if (type === 'export') {
      if (quota.exportCount >= quota.maxExports) return { allowed: false, quota };
      quota.exportCount += 1;
    }
    quota.updatedAt = new Date().toISOString();
    this.persist();
    return { allowed: true, quota };
  }

  // --- Saved Profiles ---
  getSavedProfiles(userId: string): SavedProfile[] {
    return this.data.savedProfiles.filter((p) => p.userId === userId);
  }

  saveProfile(profile: Omit<SavedProfile, 'id' | 'createdAt'>): SavedProfile {
    const existing = this.data.savedProfiles.find(
      (p) => p.userId === profile.userId && p.platform === profile.platform && p.handle.toLowerCase() === profile.handle.toLowerCase()
    );
    if (existing) {
      Object.assign(existing, profile);
      existing.lastAuditedAt = new Date().toISOString();
      this.persist();
      return existing;
    }
    const newProfile: SavedProfile = {
      ...profile,
      id: `prof_${crypto.randomBytes(8).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.savedProfiles.push(newProfile);
    this.persist();
    return newProfile;
  }

  deleteSavedProfile(id: string, userId: string): boolean {
    const idx = this.data.savedProfiles.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return false;
    this.data.savedProfiles.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Content Ideas ---
  getContentIdeas(userId: string): ContentIdea[] {
    return this.data.contentIdeas.filter((i) => i.userId === userId);
  }

  saveContentIdea(idea: Omit<ContentIdea, 'id' | 'createdAt'>): ContentIdea {
    const newIdea: ContentIdea = {
      ...idea,
      id: `idea_${crypto.randomBytes(8).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.contentIdeas.unshift(newIdea);
    this.persist();
    return newIdea;
  }

  deleteContentIdea(id: string, userId: string): boolean {
    const idx = this.data.contentIdeas.findIndex((i) => i.id === id && i.userId === userId);
    if (idx === -1) return false;
    this.data.contentIdeas.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Calendar Entries ---
  getCalendarEntries(userId: string): CalendarEntry[] {
    return this.data.calendarEntries.filter((c) => c.userId === userId);
  }

  createCalendarEntry(entry: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>): CalendarEntry {
    const now = new Date().toISOString();
    const newEntry: CalendarEntry = {
      ...entry,
      id: `cal_${crypto.randomBytes(8).toString('hex')}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.calendarEntries.push(newEntry);
    this.persist();
    return newEntry;
  }

  updateCalendarEntry(id: string, userId: string, updates: Partial<CalendarEntry>): CalendarEntry | undefined {
    const entry = this.data.calendarEntries.find((c) => c.id === id && c.userId === userId);
    if (!entry) return undefined;
    Object.assign(entry, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return entry;
  }

  deleteCalendarEntry(id: string, userId: string): boolean {
    const idx = this.data.calendarEntries.findIndex((c) => c.id === id && c.userId === userId);
    if (idx === -1) return false;
    this.data.calendarEntries.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- User Preferences ---
  getUserPreferences(userId: string): UserPreference {
    let pref = this.data.userPreferences.find((p) => p.userId === userId);
    if (!pref) {
      pref = {
        id: `pref_${crypto.randomBytes(8).toString('hex')}`,
        userId,
        defaultPlatform: 'instagram',
        contentNiche: 'General Growth',
        targetAudience: 'Content creators & enthusiasts',
        preferredTone: 'Engaging, informative',
        language: 'en',
        emailNotifications: true,
        darkTheme: true,
        updatedAt: new Date().toISOString(),
      };
      this.data.userPreferences.push(pref);
      this.persist();
    }
    return pref;
  }

  updateUserPreferences(userId: string, updates: Partial<UserPreference>): UserPreference {
    const pref = this.getUserPreferences(userId);
    Object.assign(pref, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return pref;
  }

  // --- Audit Events ---
  logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const audit: AuditEvent = {
      ...event,
      id: `audit_${crypto.randomBytes(8).toString('hex')}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditEvents.unshift(audit);
    // Keep max 500 audit events in memory
    if (this.data.auditEvents.length > 500) {
      this.data.auditEvents.length = 500;
    }
    this.persist();
  }

  getAuditEvents(limit = 100): AuditEvent[] {
    return this.data.auditEvents.slice(0, limit);
  }

  // --- System Stats for Admin ---
  getSystemStats() {
    return {
      totalUsers: this.data.users.length,
      activeSessions: this.data.sessions.length,
      savedProfilesCount: this.data.savedProfiles.length,
      totalCalendarEntries: this.data.calendarEntries.length,
      totalContentIdeas: this.data.contentIdeas.length,
      totalAuditEvents: this.data.auditEvents.length,
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    };
  }
}

export const db = new DatabaseStore();
