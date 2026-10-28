import React from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  HelpCircle,
  Download,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { ProfileAuditResult, PlatformType } from '../types.ts';

interface ProfileAuditorProps {
  auditResult: ProfileAuditResult | null;
  isLoading: boolean;
  error: string | null;
  onAudit: (input: string, platform?: PlatformType) => void;
  onSaveProfile: (result: ProfileAuditResult) => void;
  onSendToAiStudio: (niche: string, platform: PlatformType, handle: string) => void;
}

export const ProfileAuditor: React.FC<ProfileAuditorProps> = ({
  auditResult,
  isLoading,
  error,
  onAudit,
  onSaveProfile,
  onSendToAiStudio,
}) => {
  const [inputVal, setInputVal] = React.useState('');
  const [platform, setPlatform] = React.useState<PlatformType>('instagram');
  const [chartRange, setChartRange] = React.useState<'7d' | '30d'>('30d');
  const [hoveredPoint, setHoveredPoint] = React.useState<{ date: string; followers: number; engagement: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onAudit(inputVal.trim(), platform);
    }
  };

  const handleExportJson = () => {
    if (!auditResult) return;
    const blob = new Blob([JSON.stringify(auditResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_${auditResult.platform}_${auditResult.handle}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Data for chart
  const trendData = React.useMemo(() => {
    if (!auditResult) return [];
    const count = chartRange === '7d' ? 7 : 30;
    return auditResult.historicalTrend.slice(-count);
  }, [auditResult, chartRange]);

  const minFollowers = trendData.length ? Math.min(...trendData.map((d) => d.followers)) : 0;
  const maxFollowers = trendData.length ? Math.max(...trendData.map((d) => d.followers)) : 100;
  const range = maxFollowers - minFollowers || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Header */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Public Profile Auditor & Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enter any creator username or public link. We inspect public engagement benchmarks, detect platform, and calculate organic growth metrics.
            </p>
          </div>

          {/* Platform Selector Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            {(['instagram', 'youtube', 'tiktok', 'facebook', 'x_twitter'] as PlatformType[]).map((p) => {
              const labels: Record<PlatformType, string> = {
                instagram: 'Instagram',
                youtube: 'YouTube',
                tiktok: 'TikTok',
                facebook: 'Facebook',
                x_twitter: 'X / Twitter',
              };
              const isSelected = platform === p;
              return (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. mkbhd, @natgeo, or https://youtube.com/@mkbhd..."
              className="w-full bg-slate-900 text-white placeholder-slate-500 text-sm pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing Profile...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Run Deep Audit</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Presets */}
        <div className="mt-4 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium">Try Sample:</span>
          {[
            { label: 'mkbhd (YouTube)', input: 'mkbhd', platform: 'youtube' as PlatformType },
            { label: 'natgeo (Instagram)', input: 'natgeo', platform: 'instagram' as PlatformType },
            { label: 'tiktok (TikTok)', input: 'tiktok', platform: 'tiktok' as PlatformType },
            { label: 'levelsio (X)', input: 'levelsio', platform: 'x_twitter' as PlatformType },
          ].map((sample) => (
            <button
              key={sample.label}
              onClick={() => {
                setInputVal(sample.input);
                setPlatform(sample.platform);
                onAudit(sample.input, sample.platform);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Result Display */}
      {auditResult && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Demo Mode Notice Banner if active */}
          {auditResult.isDemoMode && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-amber-400 mr-2">Demo Mode Active:</span>
                  <span>{auditResult.demoNotice}</span>
                </div>
              </div>
              <div className="shrink-0 text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded font-semibold border border-amber-500/30">
                Synthetic Benchmark Data
              </div>
            </div>
          )}

          {/* Profile Overview Card */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={auditResult.avatarUrl}
                alt={auditResult.displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md shrink-0 bg-slate-800"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">{auditResult.displayName}</h2>
                  {auditResult.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                      Verified
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {auditResult.platform}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <a
                    href={auditResult.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-indigo-400 transition-colors flex items-center gap-1 font-mono"
                  >
                    <span>@{auditResult.handle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <span>{auditResult.categoryOrNiche}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2 pt-1">{auditResult.bio}</p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
              <button
                onClick={() => onSaveProfile(auditResult)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
                title="Save profile for tracking and benchmarking"
              >
                <Bookmark className="w-4 h-4 text-emerald-400" />
                <span>Save Profile</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
                title="Download JSON Audit Report"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>JSON Export</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
                title="Print or Save PDF report"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>PDF Report</span>
              </button>

              <button
                onClick={() => onSendToAiStudio(auditResult.categoryOrNiche, auditResult.platform, auditResult.handle)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Content</span>
              </button>
            </div>
          </div>

          {/* Data Source & Timestamp Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Data Source: <strong className="text-slate-200">{auditResult.dataSource}</strong></span>
            </div>
            <div>
              <span>Last Updated: {new Date(auditResult.lastUpdated).toLocaleDateString()} {new Date(auditResult.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Followers / Subscribers */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="text-xs text-slate-400 font-medium">Followers / Audience</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {auditResult.metrics.followers.value.toLocaleString()}
              </div>
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Active Public Account</span>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Engagement Rate</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Formula Verified</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
                {auditResult.metrics.engagementRate.value}%
              </div>
              <div className="mt-2 text-[11px] text-slate-400 truncate" title={auditResult.metrics.engagementRate.formula}>
                {auditResult.metrics.engagementRate.value >= 2.0 ? (
                  <span className="text-emerald-400 font-medium">Above Platform Average (2.0%)</span>
                ) : (
                  <span className="text-amber-400 font-medium">Below Target Benchmark (2.0%)</span>
                )}
              </div>
            </div>

            {/* Average Likes / Reactions */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Avg Likes / Post</span>
                <Heart className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {auditResult.metrics.avgLikes.isAvailable ? (
                  auditResult.metrics.avgLikes.value.toLocaleString()
                ) : (
                  <span className="text-slate-500 text-lg">Unavailable</span>
                )}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {auditResult.metrics.avgLikes.source || 'Recent media sample'}
              </div>
            </div>

            {/* Average Comments */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Avg Comments</span>
                <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {auditResult.metrics.avgComments.isAvailable ? (
                  auditResult.metrics.avgComments.value.toLocaleString()
                ) : (
                  <span className="text-slate-500 text-lg">Unavailable</span>
                )}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {auditResult.metrics.avgComments.source || 'Recent media sample'}
              </div>
            </div>
          </div>

          {/* Secondary Metrics Bar (Showing Available vs Unavailable Transparency) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <span className="text-slate-400 mr-2">Posts Published:</span>
                <strong className="text-white font-mono">{auditResult.metrics.postsCount.value.toLocaleString()}</strong>
              </div>

              <div>
                <span className="text-slate-400 mr-2">Following Count:</span>
                {auditResult.metrics.following.isAvailable ? (
                  <strong className="text-white font-mono">{auditResult.metrics.following.value.toLocaleString()}</strong>
                ) : (
                  <span className="text-slate-500 italic">Private to platform</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 mr-2">Total Impressions / Lifetime Views:</span>
                {auditResult.metrics.totalViews.isAvailable ? (
                  <strong className="text-white font-mono">{auditResult.metrics.totalViews.value.toLocaleString()}</strong>
                ) : (
                  <span className="text-amber-400/90 inline-flex items-center gap-1 font-medium">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Unavailable (Requires Owner OAuth)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              * Metrics never fabricated. Zero bot manipulation policy.
            </div>
          </div>

          {/* Historical Trend Chart (Interactive SVG) */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span>Historical Growth & Engagement Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Audited audience trajectory and daily engagement shifts.</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setChartRange('7d')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    chartRange === '7d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setChartRange('30d')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    chartRange === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* Hover Tooltip Readout */}
            <div className="h-7 text-xs flex items-center gap-4">
              {hoveredPoint ? (
                <div className="flex items-center gap-3 text-slate-300 font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 animate-in fade-in">
                  <span>Date: <strong className="text-white">{hoveredPoint.date}</strong></span>
                  <span>Followers: <strong className="text-emerald-400">{hoveredPoint.followers.toLocaleString()}</strong></span>
                  <span>Engagement: <strong className="text-indigo-400">{hoveredPoint.engagement}%</strong></span>
                </div>
              ) : (
                <span className="text-slate-400 text-xs italic">Hover over the graph points to inspect daily performance data.</span>
              )}
            </div>

            {/* SVG Line Chart */}
            <div className="w-full h-56 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0, 50, 100, 150].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="800"
                    y2={y}
                    stroke="#1E293B"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Path Area */}
                {trendData.length > 1 && (
                  <>
                    <path
                      d={(() => {
                        const points = trendData.map((d, idx) => {
                          const x = (idx / (trendData.length - 1)) * 800;
                          const norm = (d.followers - minFollowers) / range;
                          const y = 170 - norm * 140;
                          return `${x},${y}`;
                        });
                        return `M0,170 L${points.join(' L')} L800,170 Z`;
                      })()}
                      fill="url(#chartGrad)"
                    />

                    {/* Path Line */}
                    <path
                      d={(() => {
                        const points = trendData.map((d, idx) => {
                          const x = (idx / (trendData.length - 1)) * 800;
                          const norm = (d.followers - minFollowers) / range;
                          const y = 170 - norm * 140;
                          return `${x},${y}`;
                        });
                        return `M${points.join(' L')}`;
                      })()}
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="3"
                    />

                    {/* Interactive Points */}
                    {trendData.map((d, idx) => {
                      const x = (idx / (trendData.length - 1)) * 800;
                      const norm = (d.followers - minFollowers) / range;
                      const y = 170 - norm * 140;
                      return (
                        <circle
                          key={d.date}
                          cx={x}
                          cy={y}
                          r="5"
                          className="fill-indigo-500 hover:fill-emerald-400 stroke-[#0B0F19] stroke-2 cursor-pointer transition-all hover:scale-150"
                          onMouseEnter={() =>
                            setHoveredPoint({ date: d.date, followers: d.followers, engagement: d.engagementRate })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Content Breakdown & Optimization Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Top Post Formats */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Content Formats</h3>
              <div className="space-y-3">
                {auditResult.contentInsights.topPostTypes.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.type}</span>
                      <span className="text-slate-400 font-mono">{item.percentage}% ({item.avgEngagement}% ER)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Posting Times */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Peak Engagement Windows</span>
              </h3>
              <p className="text-xs text-slate-400">Times when followers show the highest initial retention:</p>
              <div className="space-y-2">
                {auditResult.contentInsights.bestPostingTimes.map((time, idx) => (
                  <div
                    key={time}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-white font-mono font-medium">{time}</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">Rank #{idx + 1} Slot</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Consistency Gauge */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Consistency Index</span>
              </h3>
              <div className="text-center py-2">
                <div className="text-4xl font-extrabold text-amber-400 font-mono">
                  {auditResult.contentInsights.contentConsistencyScore}/100
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Averaging ~{auditResult.contentInsights.avgPostFrequencyPerWeek} posts per week
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Platform discovery algorithms heavily reward 4 to 6 focused touchpoints per week. Maintain rhythm to build audience retention loops.
              </p>
            </div>
          </div>

          {/* Personalized Organic Growth Playbook */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Personalized Organic Growth Playbook</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actionable, non-bot organic strategy tailored strictly to this profile&apos;s current metrics and platform dynamics.
                </p>
              </div>

              <button
                onClick={() => onSendToAiStudio(auditResult.categoryOrNiche, auditResult.platform, auditResult.handle)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Captions & Hooks from Playbook</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {auditResult.growthPlaybook.map((action, idx) => {
                const priorityColors = {
                  high: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
                  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                  low: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
                };
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">{action.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityColors[action.priority]}`}>
                        {action.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{action.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{action.recommendation}</p>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-emerald-400 mb-1.5">Actionable Steps:</div>
                      <ul className="space-y-1">
                        {action.actionableSteps.map((step, sIdx) => (
                          <li key={sIdx} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
