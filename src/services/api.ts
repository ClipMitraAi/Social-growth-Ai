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

import { getCustomKeys } from './customKeys.ts';
import { GoogleGenAI } from '@google/genai';

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
  const customKeys = getCustomKeys();
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Attach user's custom API keys so backend can utilize them
  if (customKeys.geminiApiKey) {
    headers.set('x-custom-gemini-key', customKeys.geminiApiKey.trim());
  }
  if (customKeys.youtubeApiKey) {
    headers.set('x-custom-youtube-key', customKeys.youtubeApiKey.trim());
    headers.set('x-custom-platform-key', customKeys.youtubeApiKey.trim());
  }
  if (customKeys.instagramAccessToken) {
    headers.set('x-custom-instagram-token', customKeys.instagramAccessToken.trim());
  }

  // Resolve base URL: if user specified a custom backend URL (e.g. for APK deployment), use it
  let url = endpoint;
  if (customKeys.backendServerUrl && endpoint.startsWith('/api')) {
    const base = customKeys.backendServerUrl.replace(/\/+$/, '');
    url = `${base}${endpoint}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

/**
 * Direct client-side AI generation using @google/genai.
 * Allows the Android APK or web app to run 100% standalone if the user inputs their own Gemini API key.
 */
export async function directClientGenerateContent(
  params: {
    platform: PlatformType;
    niche: string;
    topic: string;
    targetAudience: string;
    tone: string;
    language?: string;
  },
  apiKey: string
): Promise<GeneratedContentResult> {
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const prompt = `You are the lead social growth strategist and viral copywriter for ${params.platform}.
Generate high-converting, organic social content for the following brief:
- Platform: ${params.platform}
- Niche: ${params.niche}
- Topic: ${params.topic}
- Target Audience: ${params.targetAudience}
- Desired Tone: ${params.tone}
- Language: ${params.language || 'en'}

Respond ONLY with a single valid JSON object matching:
{
  "captions": [
    {"label": "Punchy Hook", "text": "...", "characterCount": 120},
    {"label": "Storytelling & Value", "text": "...", "characterCount": 280},
    {"label": "Direct Question / Engagement", "text": "...", "characterCount": 160}
  ],
  "hashtags": {
    "recommended": ["#tag1", "#tag2", "#tag3"],
    "highReach": ["#broad1", "#broad2"],
    "nicheSpecific": ["#niche1", "#niche2", "#niche3"]
  },
  "videoHooks": [
    {"type": "Contrarian / Curiosity", "hook": "...", "explanation": "..."},
    {"type": "Pain Point & Solution", "hook": "...", "explanation": "..."},
    {"type": "Immediate Demonstration", "hook": "...", "explanation": "..."}
  ],
  "videoScript": {
    "duration": "30-45 seconds",
    "hook": "...",
    "bodyPoints": [
      {"timecode": "0:00 - 0:03", "visualCue": "...", "spokenAudio": "..."},
      {"timecode": "0:03 - 0:25", "visualCue": "...", "spokenAudio": "..."},
      {"timecode": "0:25 - 0:35", "visualCue": "...", "spokenAudio": "..."}
    ],
    "callToAction": "..."
  },
  "thumbnailTitles": [
    {"title": "...", "ctrScore": 94, "thumbnailVisualDescription": "..."}
  ],
  "contentCalendarWeek": [
    {"day": "Monday", "suggestedTime": "11:30 AM", "format": "Short / Reel", "angle": "...", "sampleHook": "..."}
  ],
  "strategicImprovements": ["..."]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const parsed = JSON.parse(response.text?.trim() || '{}');
  return {
    ...parsed,
    providerUsed: 'gemini-3.8-flash (Direct Mobile Device Mode)',
    isFallback: false,
  };
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
    const customKeys = getCustomKeys();
    
    // If user explicitly configured direct client mode and provided key, call Gemini directly on device
    if (customKeys.useDirectClientAi && customKeys.geminiApiKey) {
      try {
        const directResult = await directClientGenerateContent(params, customKeys.geminiApiKey);
        return { success: true, data: directResult };
      } catch (clientErr) {
        console.warn('Direct client Gemini generation failed, falling back to server request:', clientErr);
      }
    }

    try {
      return await request<{ success: boolean; data: GeneratedContentResult }>('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (serverErr) {
      // If server request fails (e.g. standalone mobile APK with custom key), try direct client Gemini
      if (customKeys.geminiApiKey) {
        const directResult = await directClientGenerateContent(params, customKeys.geminiApiKey);
        return { success: true, data: directResult };
      }
      throw serverErr;
    }
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
