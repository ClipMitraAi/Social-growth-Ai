import {
  User,
  UsageQuota,
  UserPreferences,
  ProfileAuditResult,
  SavedProfile,
  ContentIdea,
  CalendarEntry,
  GeneratedContentResult,
  PlatformType,
} from '../types.ts';

const TOKEN_KEY = 'sga_session_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(email: string, password: string, name: string) {
    const res = await request<{ token: string; user: User; quota: UsageQuota; preferences: UserPreferences }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, name }) }
    );
    setStoredToken(res.token);
    return res;
  },

  async login(email: string, password: string) {
    const res = await request<{ token: string; user: User; quota: UsageQuota; preferences: UserPreferences }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    setStoredToken(res.token);
    return res;
  },

  async demoLogin(role: 'creator' | 'admin') {
    const res = await request<{ token: string; user: User; quota: UsageQuota; preferences: UserPreferences }>(
      '/api/auth/demo-login',
      { method: 'POST', body: JSON.stringify({ role }) }
    );
    setStoredToken(res.token);
    return res;
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  async getMe() {
    return request<{ user: User | null; quota?: UsageQuota; preferences?: UserPreferences }>('/api/auth/me');
  },

  async deleteAccount() {
    const res = await request<{ success: boolean; message: string }>('/api/auth/delete-account', {
      method: 'DELETE',
    });
    setStoredToken(null);
    return res;
  },

  // Audits & Profiles
  async auditProfile(input: string, platform?: PlatformType) {
    return request<{ success: boolean; data: ProfileAuditResult }>('/api/profiles/audit', {
      method: 'POST',
      body: JSON.stringify({ input, platform }),
    });
  },

  async getSavedProfiles() {
    return request<{ profiles: SavedProfile[] }>('/api/profiles/saved');
  },

  async saveProfile(profile: Partial<SavedProfile>) {
    return request<{ success: boolean; profile: SavedProfile }>('/api/profiles/save', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  async deleteSavedProfile(id: string) {
    return request<{ success: boolean }>(`/api/profiles/saved/${id}`, { method: 'DELETE' });
  },

  // AI Growth Assistant
  async generateContent(params: {
    platform: PlatformType;
    niche: string;
    topic: string;
    targetAudience: string;
    tone: string;
    language?: string;
  }) {
    return request<{ success: boolean; data: GeneratedContentResult }>('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getSavedIdeas() {
    return request<{ ideas: ContentIdea[] }>('/api/ai/ideas');
  },

  async saveIdea(idea: Partial<ContentIdea>) {
    return request<{ success: boolean; idea: ContentIdea }>('/api/ai/ideas', {
      method: 'POST',
      body: JSON.stringify(idea),
    });
  },

  async deleteIdea(id: string) {
    return request<{ success: boolean }>(`/api/ai/ideas/${id}`, { method: 'DELETE' });
  },

  // Calendar
  async getCalendarEntries() {
    return request<{ entries: CalendarEntry[] }>('/api/calendar');
  },

  async createCalendarEntry(entry: Partial<CalendarEntry>) {
    return request<{ success: boolean; entry: CalendarEntry }>('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  async updateCalendarEntry(id: string, updates: Partial<CalendarEntry>) {
    return request<{ success: boolean; entry: CalendarEntry }>(`/api/calendar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteCalendarEntry(id: string) {
    return request<{ success: boolean }>(`/api/calendar/${id}`, { method: 'DELETE' });
  },

  // Preferences
  async updatePreferences(prefs: Partial<UserPreferences>) {
    return request<{ success: boolean; preferences: UserPreferences }>('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  },

  // Admin
  async getAdminHealth() {
    return request<{
      status: string;
      timestamp: string;
      nodeVersion: string;
      uptimeSeconds: number;
      database: string;
      aiServiceStatus: string;
    }>('/api/admin/health');
  },

  async getAdminStats() {
    return request<{ stats: any }>('/api/admin/stats');
  },

  async getAdminPlatforms() {
    return request<{ platforms: any[] }>('/api/admin/platforms');
  },

  async getAdminLogs() {
    return request<{ logs: any[] }>('/api/admin/logs');
  },
};
