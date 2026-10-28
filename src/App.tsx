import React from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { ProfileAuditor } from './components/ProfileAuditor.tsx';
import { AiStudio } from './components/AiStudio.tsx';
import { ContentCalendar } from './components/ContentCalendar.tsx';
import { SavedProfiles } from './components/SavedProfiles.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ApiKeysModal } from './components/ApiKeysModal.tsx';
import { api, getStoredToken } from './services/api.ts';
import { getCustomKeys } from './services/customKeys.ts';
import {
  User,
  UsageQuota,
  UserPreferences,
  ProfileAuditResult,
  SavedProfile,
  CalendarEntry,
  PlatformType,
} from './types.ts';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<string>('overview');
  const [user, setUser] = React.useState<User | null>(null);
  const [quota, setQuota] = React.useState<UsageQuota | undefined>(undefined);
  const [preferences, setPreferences] = React.useState<UserPreferences | undefined>(undefined);

  // Data states
  const [auditResult, setAuditResult] = React.useState<ProfileAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = React.useState<boolean>(false);
  const [auditError, setAuditError] = React.useState<string | null>(null);

  const [savedProfiles, setSavedProfiles] = React.useState<SavedProfile[]>([]);
  const [calendarEntries, setCalendarEntries] = React.useState<CalendarEntry[]>([]);

  // AI studio preset handoff
  const [aiPreset, setAiPreset] = React.useState<{ platform: PlatformType; niche: string; topic: string }>({
    platform: 'instagram',
    niche: 'Tech & AI Growth',
    topic: 'How to scale your audience organically in 2026',
  });

  // Modals & Feedback
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [apiKeysModalOpen, setApiKeysModalOpen] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState<'settings' | 'android'>('settings');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial load
  const loadInitialData = React.useCallback(async () => {
    try {
      const meRes = await api.getMe();
      if (meRes.user) {
        setUser(meRes.user);
        setQuota(meRes.quota);
        setPreferences(meRes.preferences);
        // Load user saved data
        const [pRes, cRes] = await Promise.all([
          api.getSavedProfiles().catch(() => ({ profiles: [] })),
          api.getCalendarEntries().catch(() => ({ entries: [] })),
        ]);
        setSavedProfiles(pRes.profiles);
        setCalendarEntries(cRes.entries);
      }
    } catch {
      // Guest mode
    }
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handlers
  const handleRunAudit = async (input: string, platform?: PlatformType) => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const res = await api.auditProfile(input, platform);
      setAuditResult(res.data);
      setActiveTab('auditor');
      showToast(`Audit completed for @${res.data.handle}!`);
      // Update quota if returned
      const meRes = await api.getMe();
      if (meRes.quota) setQuota(meRes.quota);
    } catch (err: any) {
      setAuditError(err.message || 'Audit failed. Please verify username or public URL.');
      setActiveTab('auditor');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveProfile = async (result: ProfileAuditResult) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await api.saveProfile({
        platform: result.platform,
        handle: result.handle,
        profileUrl: result.profileUrl,
        displayName: result.displayName,
        avatarUrl: result.avatarUrl,
        bio: result.bio,
        followersCount: result.metrics.followers.value,
        followingCount: result.metrics.following.value,
        postsCount: result.metrics.postsCount.value,
        engagementRate: result.metrics.engagementRate.value,
        notes: `Audited on ${new Date().toLocaleDateString()}. Data source: ${result.dataSource}`,
        tags: [result.categoryOrNiche, 'Tracked Profile'],
      });
      const pRes = await api.getSavedProfiles();
      setSavedProfiles(pRes.profiles);
      showToast(`@${result.handle} saved to your tracked watchlist!`);
    } catch (err: any) {
      showToast(`Failed to save: ${err.message}`);
    }
  };

  const handleDeleteSavedProfile = async (id: string) => {
    try {
      await api.deleteSavedProfile(id);
      setSavedProfiles((prev) => prev.filter((p) => p.id !== id));
      showToast('Profile removed from watchlist.');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSendToAiStudio = (niche: string, platform: PlatformType, handle: string) => {
    setAiPreset({
      platform,
      niche: niche || 'Content Creation',
      topic: `Strategic growth breakdown & content hook for @${handle}`,
    });
    setActiveTab('ai-studio');
  };

  const handleCreateCalendarEntry = async (entry: Partial<CalendarEntry>) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const res = await api.createCalendarEntry(entry);
    setCalendarEntries((prev) => [...prev, res.entry]);
    showToast('Post added to Content Calendar!');
  };

  const handleUpdateCalendarStatus = async (id: string, status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED') => {
    const res = await api.updateCalendarEntry(id, { status });
    setCalendarEntries((prev) => prev.map((e) => (e.id === id ? res.entry : e)));
    showToast(`Status updated to ${status}.`);
  };

  const handleDeleteCalendarEntry = async (id: string) => {
    await api.deleteCalendarEntry(id);
    setCalendarEntries((prev) => prev.filter((e) => e.id !== id));
    showToast('Scheduled post deleted.');
  };

  const handleGenerateAi = async (params: any) => {
    const res = await api.generateContent(params);
    // Refresh quota
    const meRes = await api.getMe();
    if (meRes.quota) setQuota(meRes.quota);
    showToast('AI Assets generated successfully!');
    return res.data;
  };

  const handleSaveAiIdea = async (idea: any) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    await api.saveIdea(idea);
    showToast('Idea saved to your creative vault!');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setQuota(undefined);
    setSavedProfiles([]);
    setCalendarEntries([]);
    showToast('Signed out successfully.');
  };

  const handleAuthSuccess = (data: { user: User; quota: UsageQuota; preferences: UserPreferences }) => {
    setUser(data.user);
    setQuota(data.quota);
    setPreferences(data.preferences);
    loadInitialData();
    showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#111827] border border-indigo-500/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        quota={quota}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => {
          setSettingsTab('settings');
          setSettingsModalOpen(true);
        }}
        onOpenAndroidInfo={() => {
          setSettingsTab('android');
          setSettingsModalOpen(true);
        }}
        onOpenApiKeys={() => setApiKeysModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <LandingHero
              onSearch={handleRunAudit}
              onExploreFeatures={() => setActiveTab('auditor')}
              onOpenAuth={() => setAuthModalOpen(true)}
            />

            {/* Quick Feature Jump Banner */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
              <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/30 via-slate-900 to-purple-900/30 border border-slate-800 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready to Supercharge Organic Growth?</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Audit Competitors, Extract Hooks, and Schedule Posts in One Seamless Workspace.
                </h2>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('auditor')}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Launch Profile Auditor
                  </button>
                  <button
                    onClick={() => setActiveTab('ai-studio')}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Open AI Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auditor' && (
          <ProfileAuditor
            auditResult={auditResult}
            isLoading={isAuditing}
            error={auditError}
            onAudit={handleRunAudit}
            onSaveProfile={handleSaveProfile}
            onSendToAiStudio={handleSendToAiStudio}
          />
        )}

        {activeTab === 'ai-studio' && (
          <AiStudio
            initialPlatform={aiPreset.platform}
            initialNiche={aiPreset.niche}
            initialTopic={aiPreset.topic}
            quota={quota}
            onGenerate={handleGenerateAi}
            onSaveIdea={handleSaveAiIdea}
            onScheduleToCalendar={handleCreateCalendarEntry}
          />
        )}

        {activeTab === 'calendar' && (
          <ContentCalendar
            entries={calendarEntries}
            onCreateEntry={handleCreateCalendarEntry}
            onUpdateStatus={handleUpdateCalendarStatus}
            onDeleteEntry={handleDeleteCalendarEntry}
          />
        )}

        {activeTab === 'saved' && (
          <SavedProfiles
            profiles={savedProfiles}
            onAuditProfile={(handle, p) => handleRunAudit(handle, p)}
            onDeleteProfile={handleDeleteSavedProfile}
          />
        )}

        {activeTab === 'admin' && <AdminPortal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Social Growth AI</span>
            <span>•</span>
            <span>© 2026 Social Growth AI Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setSettingsTab('android');
                setSettingsModalOpen(true);
              }}
              className="hover:text-indigo-400 transition-colors"
            >
              Android APK Guide
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setSettingsTab('settings');
                setSettingsModalOpen(true);
              }}
              className="hover:text-indigo-400 transition-colors"
            >
              GDPR Privacy Export
            </button>
            <span>•</span>
            <button
              onClick={() => setApiKeysModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              🔑 Configure My API Keys
            </button>
            <span>•</span>
            <span className="text-emerald-400/90 font-medium">100% Organic Platform Compliance</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ApiKeysModal
        isOpen={apiKeysModalOpen}
        onClose={() => setApiKeysModalOpen(false)}
        onKeysSaved={() => showToast('API Keys saved and activated on this device!')}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
        quota={quota}
        preferences={preferences}
        onUpdatePreferences={async (p) => {
          const res = await api.updatePreferences(p);
          setPreferences(res.preferences);
          showToast('Preferences updated');
        }}
        onAccountDeleted={() => {
          setUser(null);
          setQuota(undefined);
          setSavedProfiles([]);
          setCalendarEntries([]);
          setActiveTab('overview');
          showToast('Account permanently removed.');
        }}
        initialTab={settingsTab}
      />
    </div>
  );
}
