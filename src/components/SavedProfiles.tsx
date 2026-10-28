import React from 'react';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Tag,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { SavedProfile, PlatformType } from '../types.ts';

interface SavedProfilesProps {
  profiles: SavedProfile[];
  onAuditProfile: (handle: string, platform: PlatformType) => void;
  onDeleteProfile: (id: string) => Promise<void>;
}

export const SavedProfiles: React.FC<SavedProfilesProps> = ({
  profiles,
  onAuditProfile,
  onDeleteProfile,
}) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id]; // keep max 2 for side-by-side comparison
      }
      return [...prev, id];
    });
  };

  const comparedProfiles = profiles.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-emerald-400" />
            <span>Saved Profiles & Competitor Benchmarks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track creator accounts, monitor ongoing performance shifts, and compare two competitors side-by-side.
          </p>
        </div>

        {profiles.length >= 2 && (
          <div className="text-xs text-slate-300 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
            Select any 2 cards below to activate <strong>Side-by-Side Comparison</strong>.
          </div>
        )}
      </div>

      {/* Side-by-Side Comparator Section (if 2 selected) */}
      {comparedProfiles.length === 2 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Direct Head-to-Head Benchmark Comparison</span>
            </h2>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Comparison
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {comparedProfiles.map((p, idx) => (
              <div
                key={p.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        p.avatarUrl ||
                        `https://images.unsplash.com/photo-1534528741775?w=100&auto=format&fit=crop&q=80`
                      }
                      alt={p.displayName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base">{p.displayName}</h3>
                      <span className="text-xs font-mono text-slate-400">@{p.handle} ({p.platform})</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded">
                    Account #{idx + 1}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Total Audience</div>
                    <div className="text-lg font-bold text-white font-mono mt-1">
                      {p.followersCount.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Engagement Rate</div>
                    <div className="text-lg font-bold text-indigo-400 font-mono mt-1">
                      {p.engagementRate}%
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  <strong>Strategic Note:</strong> {p.notes || 'No custom notes added.'}
                </div>

                <button
                  onClick={() => onAuditProfile(p.handle, p.platform)}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <span>Re-Audit Fresh Metrics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Saved Profiles Yet</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Audit creator profiles using the Auditor tool, then click &ldquo;Save Profile&rdquo; to build your competitor watchlist.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const isSelected = selectedIds.includes(profile.id);

            return (
              <div
                key={profile.id}
                className={`bg-[#111827] rounded-2xl border p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          profile.avatarUrl ||
                          `https://images.unsplash.com/photo-1534528741775?w=100&auto=format&fit=crop&q=80`
                        }
                        alt={profile.displayName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-white text-sm">{profile.displayName}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                          <span>@{profile.handle}</span>
                          <span>•</span>
                          <span className="capitalize">{profile.platform}</span>
                        </div>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(profile.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                      title="Select for comparison"
                    />
                  </div>

                  {/* Numbers */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Followers</span>
                      <strong className="text-white font-mono text-sm">
                        {profile.followersCount.toLocaleString()}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Engagement</span>
                      <strong className="text-indigo-400 font-mono text-sm">
                        {profile.engagementRate}%
                      </strong>
                    </div>
                  </div>

                  {/* Tags */}
                  {profile.tags && profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold border border-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {profile.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      &ldquo;{profile.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onAuditProfile(profile.handle, profile.platform)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Audit</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={profile.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Open public profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onDeleteProfile(profile.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove saved profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
