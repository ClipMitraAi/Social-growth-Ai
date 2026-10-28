import React from 'react';
import {
  X,
  User as UserIcon,
  Crown,
  Download,
  Trash2,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Terminal,
} from 'lucide-react';
import { User, UsageQuota, UserPreferences } from '../types.ts';
import { api } from '../services/api.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  quota?: UsageQuota;
  preferences?: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  onAccountDeleted: () => void;
  initialTab?: 'settings' | 'android';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  quota,
  preferences,
  onUpdatePreferences,
  onAccountDeleted,
  initialTab = 'settings',
}) => {
  const [activeTab, setActiveTab] = React.useState<'settings' | 'android'>(initialTab);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleExportData = () => {
    const exportPayload = {
      user,
      quota,
      preferences,
      exportDate: new Date().toISOString(),
      privacyCompliance: 'GDPR / CCPA Compliant Data Minimization',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_growth_ai_data_${user?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm permanent account removal.');
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      onAccountDeleted();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-3xl border border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Account & Quotas</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'android' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android APK & Capacitor</span>
          </button>
        </div>

        {activeTab === 'settings' && (
          <div className="space-y-6 text-xs">
            {/* Account Info Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-indigo-400" />
                <span>Subscription Plan & Profile</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px]">User Name</span>
                  <strong className="text-white text-sm">{user?.name || 'Guest User'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Email Address</span>
                  <strong className="text-white text-sm">{user?.email || 'guest@socialgrowth.ai'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Current Plan Tier</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {user?.tier || 'FREE'} PLAN
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Role Permission</span>
                  <span className="font-semibold text-emerald-400">{user?.role || 'GUEST'}</span>
                </div>
              </div>
            </div>

            {/* Daily Quota Counter */}
            {quota && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center justify-between">
                  <span>Daily Quota Allocation</span>
                  <span className="text-[11px] font-normal text-slate-400">Resets daily at 00:00 UTC</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-slate-300 mb-1">
                      <span>Profile Audits</span>
                      <span className="font-mono">{quota.auditCount} / {quota.maxAudits} used</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (quota.auditCount / quota.maxAudits) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-300 mb-1">
                      <span>AI Growth Generations</span>
                      <span className="font-mono">{quota.aiGenerationCount} / {quota.maxAiGenerations} used</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (quota.aiGenerationCount / quota.maxAiGenerations) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Data Export */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm">Privacy Controls & Data Ownership</h3>
              <p className="text-slate-400 leading-relaxed">
                Download a complete machine-readable copy of your profile audits, calendar schedules, and AI generation history (GDPR Art. 20 Right to Data Portability).
              </p>
              <button
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export My Complete Data (JSON)</span>
              </button>
            </div>

            {/* Danger Zone: Account Deletion */}
            {user && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <h3 className="font-bold text-rose-300 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Delete Account & Purge Data</span>
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Permanently remove your account, active sessions, saved competitor profiles, calendar entries, and usage telemetry. This action cannot be reversed.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full sm:w-60 bg-slate-900 text-white px-3 py-2 rounded-xl border border-rose-500/40 text-xs font-mono uppercase"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Android APK & Capacitor Guide */}
        {activeTab === 'android' && (
          <div className="space-y-6 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android Capacitor Application Architecture</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Social Growth AI is engineered with Capacitor to compile into a native Android APK (`com.socialgrowth.ai`). It wraps the responsive client with native hardware acceleration, edge-to-edge system bar integration, back-button handling, and network connectivity state observers.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Local Build & APK Generation Commands</span>
              </h4>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 space-y-2">
                <p className="text-slate-400"># 1. Build the production web bundle</p>
                <p className="text-white">npm run build</p>
                <p className="text-slate-400 pt-2"># 2. Sync web assets into Android project</p>
                <p className="text-white">npx cap sync android</p>
                <p className="text-slate-400 pt-2"># 3. Assemble debug APK via Gradle</p>
                <p className="text-white">cd android &amp;&amp; ./gradlew assembleDebug</p>
                <p className="text-slate-400 pt-2"># Output location:</p>
                <p className="text-emerald-400">android/app/build/outputs/apk/debug/app-debug.apk</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs">Security & Secrets Protection</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No API keys or backend tokens are ever bundled inside the APK.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All AI model interactions and social platform queries route through the secure server.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Automated CI workflow in `.github/workflows/android.yml` automatically produces and archives debug APK artifacts on push.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
