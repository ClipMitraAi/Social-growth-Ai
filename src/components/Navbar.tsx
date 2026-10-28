import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Calendar,
  Bookmark,
  ShieldCheck,
  Smartphone,
  LogOut,
  User as UserIcon,
  Crown,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { User, UsageQuota } from '../types.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  quota?: UsageQuota;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenAndroidInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  quota,
  onOpenAuth,
  onLogout,
  onOpenSettings,
  onOpenAndroidInfo,
}) => {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'auditor', label: 'Auditor & Analytics', icon: BarChart3 },
    { id: 'ai-studio', label: 'AI Growth Studio', icon: Sparkles },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'saved', label: 'Saved & Compare', icon: Bookmark },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            aria-label="Social Growth AI Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Social Growth <span className="text-emerald-400">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
                Analytics & Organic Growth
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quota Progress Pill (if user logged in) */}
          {user && quota && (
            <div className="hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-slate-400">Audits:</span>
                <span className="font-semibold text-white">
                  {quota.auditCount}/{quota.maxAudits}
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-400">AI:</span>
                <span className="font-semibold text-white">
                  {quota.aiGenerationCount}/{quota.maxAiGenerations}
                </span>
              </div>
            </div>
          )}

          {/* Android APK Button */}
          <button
            onClick={onOpenAndroidInfo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/70 hover:bg-slate-700/70 text-slate-200 border border-slate-700 transition-colors"
            title="Android APK & Capacitor Integration"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android APK</span>
          </button>

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all focus:outline-none"
                aria-expanded={userMenuOpen}
                aria-label="User account menu"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <span className="block text-xs font-semibold text-slate-200 leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-medium">
                    {user.tier} {user.role === 'ADMIN' ? '• ADMIN' : ''}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111827] border border-slate-800 shadow-2xl py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white text-xs">{user.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Crown className="w-3 h-3 text-indigo-400" />
                      Plan: {user.tier} Tier
                    </span>
                  </div>

                  <button
                    onClick={onOpenSettings}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Settings & Quotas</span>
                  </button>

                  <button
                    onClick={onOpenAndroidInfo}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 sm:hidden"
                  >
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span>Android APK Setup</span>
                  </button>

                  <div className="my-1 border-t border-slate-800"></div>

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/80 bg-[#0B0F19] text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-md ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
