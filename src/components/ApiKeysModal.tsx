import React from 'react';
import {
  KeyRound,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Server,
  Sparkles,
  Youtube,
  Instagram,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Zap,
} from 'lucide-react';
import { getCustomKeys, saveCustomKeys, clearCustomKeys, UserApiKeys } from '../services/customKeys.ts';
import { GoogleGenAI } from '@google/genai';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysSaved?: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose, onKeysSaved }) => {
  const [keys, setKeys] = React.useState<UserApiKeys>(getCustomKeys());
  const [showGeminiKey, setShowGeminiKey] = React.useState(false);
  const [isTestingKey, setIsTestingKey] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setKeys(getCustomKeys());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomKeys(keys);
    setSaveSuccess(true);
    if (onKeysSaved) onKeysSaved();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all custom API keys stored on this device?')) {
      clearCustomKeys();
      setKeys(getCustomKeys());
      setTestResult(null);
      if (onKeysSaved) onKeysSaved();
    }
  };

  const handleTestGeminiKey = async () => {
    if (!keys.geminiApiKey.trim()) {
      setTestResult({ success: false, message: 'Please paste your Gemini API Key first.' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: keys.geminiApiKey.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping test: respond with OK',
      });
      if (response.text) {
        setTestResult({ success: true, message: 'Gemini API Key is valid and active! Ready to generate.' });
      } else {
        setTestResult({ success: false, message: 'Received empty response from Gemini model.' });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Key validation failed. Please check key permissions.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-3xl border border-slate-800 max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Custom API Keys & Mobile Setup</h3>
            <p className="text-xs text-slate-400">
              Configure your personal API keys. Required for standalone Android APK installations.
            </p>
          </div>
        </div>

        {/* APK Notice Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-indigo-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>After Installing the APK on Mobile:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Paste your own <strong>Gemini API Key</strong> below so that viral hooks, video scripts, captions, and title CTR engines work directly on your phone without needing a cloud subscription!
          </p>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Keys saved successfully to local device storage!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Key 1: Google Gemini API Key */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Google Gemini API Key (Recommended)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={keys.geminiApiKey}
                onChange={(e) => setKeys({ ...keys, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 text-white pl-3 pr-20 py-2.5 rounded-xl border border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="p-1 text-slate-400 hover:text-white"
                  title={showGeminiKey ? 'Hide key' : 'Show key'}
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestGeminiKey}
                  disabled={isTestingKey}
                  className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold text-[10px]"
                >
                  {isTestingKey ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Powers AI captions, 3s video hooks, 45s scripts, and organic playbooks on your device.
            </p>

            {/* Direct Client Toggle */}
            <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block text-[11px]">Direct Client-Side Mode</span>
                <span className="text-[10px] text-slate-500">Calls Gemini model directly on mobile without routing through backend.</span>
              </div>
              <input
                type="checkbox"
                checked={keys.useDirectClientAi}
                onChange={(e) => setKeys({ ...keys, useDirectClientAi: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
              />
            </div>
          </div>

          {/* Key 2: Backend Server URL (Optional for mobile APK) */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <label className="font-bold text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Backend Server URL (For Remote APK Connection)</span>
            </label>
            <input
              type="text"
              value={keys.backendServerUrl}
              onChange={(e) => setKeys({ ...keys, backendServerUrl: e.target.value })}
              placeholder="e.g. https://my-social-growth-ai.run.app"
              className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400">
              Leave blank to use the default server origin, or enter your cloud service URL if the APK is installed on a separate device.
            </p>
          </div>

          {/* Key 3: Platform APIs (YouTube & Social) */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Authorized Social Media API Keys (Optional)</span>
            </h4>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-rose-400" />
                <span>YouTube Data API v3 Key</span>
              </label>
              <input
                type="text"
                value={keys.youtubeApiKey}
                onChange={(e) => setKeys({ ...keys, youtubeApiKey: e.target.value })}
                placeholder="AIzaSy... (For real subscriber and video counts)"
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram Graph API Access Token</span>
              </label>
              <input
                type="text"
                value={keys.instagramAccessToken}
                onChange={(e) => setKeys({ ...keys, instagramAccessToken: e.target.value })}
                placeholder="EAAB... (Meta Graph Token)"
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 font-mono text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Keys</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Apply Keys</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
