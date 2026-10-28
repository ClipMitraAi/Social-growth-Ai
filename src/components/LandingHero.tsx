import React from 'react';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Calendar,
  Lock,
  ArrowRight,
  Zap,
  Globe2,
  Sliders,
} from 'lucide-react';
import { PlatformType } from '../types.ts';

interface LandingHeroProps {
  onSearch: (input: string, platform?: PlatformType) => void;
  onExploreFeatures: () => void;
  onOpenAuth: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSearch,
  onExploreFeatures,
  onOpenAuth,
}) => {
  const [searchInput, setSearchInput] = React.useState('');
  const [selectedPlatform, setSelectedPlatform] = React.useState<PlatformType>('instagram');

  const sampleProfiles = [
    { label: 'NatGeo (IG)', input: 'natgeo', platform: 'instagram' as PlatformType },
    { label: 'MKBHD (YT)', input: 'mkbhd', platform: 'youtube' as PlatformType },
    { label: 'TikTok Official', input: 'tiktok', platform: 'tiktok' as PlatformType },
    { label: 'Tech Crunch (FB)', input: 'techcrunch', platform: 'facebook' as PlatformType },
    { label: 'Levelsio (X)', input: 'levelsio', platform: 'x_twitter' as PlatformType },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim(), selectedPlatform);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 text-center max-w-4xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-emerald-500/15 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 mb-8 shadow-inner animate-pulse">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Organic • Authorized APIs • Zero Fake Metrics or Bots</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Stop Guessing Algorithms.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Scale Organically With AI.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Audit any public creator profile, inspect unvarnished engagement benchmarks, and generate viral hooks, scripts, and content schedules backed by Gemini AI.
        </p>

        {/* Live Interactive Search Box */}
        <div className="mt-10 max-w-2xl mx-auto bg-slate-900/90 p-2 sm:p-3 rounded-2xl border border-slate-700 shadow-2xl shadow-indigo-950/40">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter username or public profile URL..."
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                aria-label="Enter social media username or profile URL"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as PlatformType)}
                className="bg-slate-800 text-slate-200 text-xs sm:text-sm px-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                aria-label="Select platform"
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="x_twitter">X / Twitter</option>
              </select>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Sample Presets */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-center flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Demo Profiles:</span>
            {sampleProfiles.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setSearchInput(p.input);
                  setSelectedPlatform(p.platform);
                  onSearch(p.input, p.platform);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <BarChart2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Public Audits</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Real engagement rate, view ratios, and 30d trends.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">AI Studio</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Viral hooks, full 45s scripts, & hashtag clusters.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Calendar</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Schedule posts & align with peak engagement windows.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Zero Scrape</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">No password requests, no bot manipulation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Policy Compliance Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Legitimate Organic Growth Manifesto</span>
              </div>
              <h3 className="text-lg font-bold text-white">We never sell fake followers, fake views, or bot engagement.</h3>
              <p className="text-sm text-slate-300 max-w-2xl">
                Social Growth AI operates exclusively within permitted platform guidelines. We analyze public metadata to recommend legitimate content improvements, storytelling frameworks, and posting consistency.
              </p>
            </div>
            <button
              onClick={onExploreFeatures}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Free Tier Experience & Pricing */}
      <section className="max-w-6xl mx-auto px-4 text-center">
        <div className="space-y-3 mb-12">
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Transparent Tiers</span>
          <h2 className="text-3xl font-extrabold text-white">Generous Free Tier. No Hidden Paywalls.</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Audit public profiles and generate AI growth strategies immediately. Upgrade only when scaling a team or managing multiple client accounts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 mb-4">
                Starter Creator
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 text-sm">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">For solo creators auditing their channel and testing AI workflows.</p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10 Profile Audits / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>15 AI Content Generations / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instagram, YouTube, TikTok, Facebook, X</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Content Calendar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Export Reports in JSON / PDF format</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenAuth}
              className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border-2 border-indigo-500/80 flex flex-col justify-between relative shadow-2xl shadow-indigo-950/50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 mb-4">
                Pro Growth
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$29</span>
                <span className="text-slate-400 text-sm">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">For serious creators and brand managers scaling organic reach.</p>

              <ul className="mt-6 space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>50 Profile Audits / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>100 AI Generations / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Competitor Benchmarking Comparator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Custom Niche Persona Tuning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Priority API Rate Limit Allocation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenAuth}
              className="mt-8 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Start 14-Day Pro Trial
            </button>
          </div>

          {/* Agency Scale */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 mb-4">
                Agency & Brand Scale
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$99</span>
                <span className="text-slate-400 text-sm">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">For agencies managing client portfolios with white-label exports.</p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>500 Profile Audits / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>500 AI Generations / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Saved Client Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>White-label PDF Audit Reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Administrative Role Access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenAuth}
              className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Platform Architecture & FAQs */}
      <section className="max-w-4xl mx-auto px-4 text-left">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-white text-sm">Do you require my social media passwords or account credentials?</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Never. Social Growth AI analyzes publicly available metadata and authorized official platform APIs. We never ask for your password, scrape private credentials, or execute actions on your behalf without explicit OAuth permissions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-white text-sm">Why are some metrics marked as &quot;Unavailable&quot;?</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              We strictly adhere to platform data policies. Certain metrics—such as private story view counts, lifetime reel saves, and direct message statistics—are strictly restricted by platforms like Instagram and YouTube to verified account owners. We never fabricate data.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-white text-sm">How does the Android application work?</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Our mobile application is packaged using modern Capacitor architecture with native Android SDK support. It provides smooth gesture navigation, offline state awareness, and Android back button handling while keeping all sensitive secrets securely on the server.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
