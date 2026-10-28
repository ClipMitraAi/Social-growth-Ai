export interface UserApiKeys {
  geminiApiKey: string;
  backendServerUrl: string;
  youtubeApiKey: string;
  instagramAccessToken: string;
  tiktokClientKey: string;
  xBearerToken: string;
  useDirectClientAi: boolean;
}

const STORAGE_KEY = 'sga_user_custom_keys';

const DEFAULT_KEYS: UserApiKeys = {
  geminiApiKey: '',
  backendServerUrl: '',
  youtubeApiKey: '',
  instagramAccessToken: '',
  tiktokClientKey: '',
  xBearerToken: '',
  useDirectClientAi: false,
};

export function getCustomKeys(): UserApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_KEYS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_KEYS };
}

export function saveCustomKeys(keys: Partial<UserApiKeys>): UserApiKeys {
  const current = getCustomKeys();
  const updated = { ...current, ...keys };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save custom keys to localStorage', err);
  }
  return updated;
}

export function clearCustomKeys(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fallback
  }
}
