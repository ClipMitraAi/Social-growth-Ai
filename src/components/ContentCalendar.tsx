import React from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Filter,
  Send,
  Video,
  FileText,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';
import { CalendarEntry, PlatformType } from '../types.ts';

interface ContentCalendarProps {
  entries: CalendarEntry[];
  onCreateEntry: (entry: Partial<CalendarEntry>) => Promise<void>;
  onUpdateStatus: (id: string, status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED') => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  entries,
  onCreateEntry,
  onUpdateStatus,
  onDeleteEntry,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [platformFilter, setPlatformFilter] = React.useState<string>('all');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // New entry form state
  const [platform, setPlatform] = React.useState<PlatformType>('instagram');
  const [scheduledDate, setScheduledDate] = React.useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledTimeStr, setScheduledTimeStr] = React.useState('14:00');
  const [caption, setCaption] = React.useState('');
  const [hashtagsStr, setHashtagsStr] = React.useState('#growth #creators #2026');
  const [mediaType, setMediaType] = React.useState('reel');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const filteredEntries = React.useMemo(() => {
    return entries.filter((e) => {
      if (platformFilter === 'all') return true;
      return e.platform === platformFilter;
    });
  }, [entries, platformFilter]);

  const handleCopyPost = (entry: CalendarEntry) => {
    const fullText = `${entry.caption}\n\n${entry.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setIsSubmitting(true);
    try {
      const scheduledIso = new Date(`${scheduledDate}T${scheduledTimeStr}:00`).toISOString();
      const tags = hashtagsStr
        .split(' ')
        .map((t) => t.trim())
        .filter((t) => t.startsWith('#'));

      await onCreateEntry({
        platform,
        scheduledTime: scheduledIso,
        caption,
        hashtags: tags,
        mediaType,
        notes,
        status: 'SCHEDULED',
      });

      setIsModalOpen(false);
      setCaption('');
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
            <span>Multi-Platform Content Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize distribution schedules, track drafts vs published slots, and execute timely organic posting.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Post</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-[#111827] p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-slate-400 font-semibold">Filter Channel:</span>
          {['all', 'instagram', 'youtube', 'tiktok', 'facebook', 'x_twitter'].map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                platformFilter === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p === 'all' ? 'All Platforms' : p === 'x_twitter' ? 'X / Twitter' : p}
            </button>
          ))}
        </div>

        <div className="text-slate-400 font-mono text-[11px] pr-2">
          Total Scheduled: <strong className="text-white">{filteredEntries.length}</strong>
        </div>
      </div>

      {/* Calendar Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Scheduled Posts Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your schedule is currently clear. Use the AI Studio or click &ldquo;Schedule New Post&rdquo; to plan your upcoming content queue.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => {
            const dateObj = new Date(entry.scheduledTime);
            const statusColors = {
              DRAFT: 'bg-slate-800 text-slate-300 border-slate-700',
              SCHEDULED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
              PUBLISHED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              ARCHIVED: 'bg-slate-800 text-slate-400 border-slate-700',
            };

            return (
              <div
                key={entry.id}
                className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                      {entry.platform} • {entry.mediaType}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        statusColors[entry.status]
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {dateObj.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Caption snippet */}
                  <p className="text-xs text-slate-200 line-clamp-4 leading-relaxed font-sans whitespace-pre-line">
                    {entry.caption}
                  </p>

                  {/* Hashtags */}
                  {entry.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entry.hashtags.slice(0, 4).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-emerald-400/90">
                          {tag}
                        </span>
                      ))}
                      {entry.hashtags.length > 4 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{entry.hashtags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {entry.notes && (
                    <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80 italic">
                      Note: {entry.notes}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCopyPost(entry)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Copy full caption and hashtags for posting"
                  >
                    {copiedId === entry.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Post</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {entry.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => onUpdateStatus(entry.id, 'PUBLISHED')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-[11px] transition-colors"
                        title="Mark as published"
                      >
                        Mark Published
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete entry"
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

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] rounded-2xl border border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <span>Schedule Content Post</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Channel Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as PlatformType)}
                    className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="x_twitter">X / Twitter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Media Format</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700"
                  >
                    <option value="reel">Reel / Short Video</option>
                    <option value="carousel">Multi-Slide Carousel</option>
                    <option value="post">Single Image Post</option>
                    <option value="thread">Text Thread / Update</option>
                    <option value="video">Long-Form Video</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Time (Peak Window)</label>
                  <input
                    type="time"
                    value={scheduledTimeStr}
                    onChange={(e) => setScheduledTimeStr(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Caption / Spoken Hook</label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Draft your opening line and value body here..."
                  className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hashtags (Space separated)</label>
                <input
                  type="text"
                  value={hashtagsStr}
                  onChange={(e) => setHashtagsStr(e.target.value)}
                  placeholder="#growth #creator #marketing"
                  className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Production Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Export B-roll from Premiere, tag collaborator"
                  className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
