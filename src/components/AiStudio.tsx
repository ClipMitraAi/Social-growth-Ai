import React from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Calendar,
  Bookmark,
  Video,
  FileText,
  Hash,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { GeneratedContentResult, PlatformType, UsageQuota } from '../types.ts';

interface AiStudioProps {
  initialPlatform?: PlatformType;
  initialNiche?: string;
  initialTopic?: string;
  quota?: UsageQuota;
  onGenerate: (params: {
    platform: PlatformType;
    niche: string;
    topic: string;
    targetAudience: string;
    tone: string;
    language: string;
  }) => Promise<GeneratedContentResult>;
  onSaveIdea: (idea: any) => Promise<void>;
  onScheduleToCalendar: (entry: { platform: string; scheduledTime: string; caption: string; hashtags: string[]; mediaType: string }) => Promise<void>;
}

export const AiStudio: React.FC<AiStudioProps> = ({
  initialPlatform = 'instagram',
  initialNiche = 'Tech & AI Growth',
  initialTopic = 'How to get your first 1,000 real followers in 2026',
  quota,
  onGenerate,
  onSaveIdea,
  onScheduleToCalendar,
}) => {
  const [platform, setPlatform] = React.useState<PlatformType>(initialPlatform);
  const [niche, setNiche] = React.useState(initialNiche);
  const [topic, setTopic] = React.useState(initialTopic);
  const [targetAudience, setTargetAudience] = React.useState('Creators, founders, and professionals');
  const [tone, setTone] = React.useState('Authoritative, engaging, high energy');
  const [language, setLanguage] = React.useState('en');

  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<GeneratedContentResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'captions' | 'script' | 'thumbnails' | 'calendar' | 'strategy'>('captions');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Sync if props update from auditor
  React.useEffect(() => {
    if (initialPlatform) setPlatform(initialPlatform);
    if (initialNiche) setNiche(initialNiche);
    if (initialTopic) setTopic(initialTopic);
  }, [initialPlatform, initialNiche, initialTopic]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic || !niche) {
      setError('Please provide both niche and topic.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSavedSuccess(false);
    try {
      const generated = await onGenerate({
        platform,
        niche,
        topic,
        targetAudience,
        tone,
        language,
      });
      setResult(generated);
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentIdea = async () => {
    if (!result) return;
    try {
      await onSaveIdea({
        platform,
        niche,
        topic,
        title: result.thumbnailTitles?.[0]?.title || topic,
        hook: result.videoHooks?.[0]?.hook || '',
        script: result.videoScript?.callToAction || '',
        captions: result.captions.map((c) => c.text),
        hashtags: result.hashtags.recommended,
        score: result.thumbnailTitles?.[0]?.ctrScore || 90,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save idea.');
    }
  };

  const handlePushToCalendar = async (caption: string, hook: string) => {
    try {
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      await onScheduleToCalendar({
        platform,
        scheduledTime: tomorrow,
        caption: `${hook}\n\n${caption}`,
        hashtags: result?.hashtags.recommended || [],
        mediaType: platform === 'youtube' ? 'video' : platform === 'instagram' ? 'reel' : 'post',
      });
      alert('Post scheduled in Content Calendar for tomorrow!');
    } catch (err: any) {
      setError(err.message || 'Failed to schedule to calendar.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>AI Organic Growth & Content Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate algorithm-tested captions, 3-second retention hooks, 45s viral scripts, and title CTR concepts powered by Gemini AI.
          </p>
        </div>

        {quota && (
          <div className="text-xs text-slate-300 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
            AI Generations: <strong className="text-emerald-400">{quota.aiGenerationCount} / {quota.maxAiGenerations}</strong> today
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Controls Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#111827] rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl h-fit">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Content Strategy Parameters</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Platform Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="instagram">Instagram (Reels, Carousels)</option>
                <option value="youtube">YouTube (Shorts & Long-form)</option>
                <option value="tiktok">TikTok (Short-Form Retention)</option>
                <option value="facebook">Facebook (Pages & Community)</option>
                <option value="x_twitter">X / Twitter (Threads & Insights)</option>
              </select>
            </div>

            {/* Content Niche */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Content Niche / Industry</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. AI & SaaS, Fitness, Personal Finance..."
                className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Content Topic */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Topic or Video Angle</label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 3 tools that save 10 hours a week for developers..."
                className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Audience Persona</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Busy professionals, college students..."
                className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Desired Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Authoritative, engaging, high energy">Authoritative & High Energy</option>
                <option value="Educational, step-by-step, actionable">Educational & Actionable</option>
                <option value="Contrarian, pattern-interrupt, provocative">Contrarian & Pattern-Interrupt</option>
                <option value="Storytelling, authentic, relatable">Authentic & Storytelling</option>
                <option value="Humorous, witty, fast-paced">Witty & Fast-Paced</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="en">English</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="pt">Portuguese (Português)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Generating AI Growth Assets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Assets</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Prompts */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Inspiration Angles:</span>
            {[
              'The #1 mistake beginners make in this niche',
              'Stop doing this outdated strategy in 2026',
              '3-step checklist to double your retention',
            ].map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => setTopic(angle)}
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[11px]"
              >
                &ldquo;{angle}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Results Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {result ? (
            <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl animate-in fade-in duration-150">
              {/* Output Top Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Engine: {result.providerUsed}
                  </span>
                  {result.isFallback && (
                    <span className="text-[11px] text-amber-400 font-medium">
                      (Offline intelligent fallback mode)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveCurrentIdea}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{savedSuccess ? 'Saved to Ideas!' : 'Save Idea'}</span>
                  </button>
                </div>
              </div>

              {/* Output Category Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
                {[
                  { id: 'captions', label: 'Captions & Hashtags', icon: FileText },
                  { id: 'script', label: 'Hooks & 45s Script', icon: Video },
                  { id: 'thumbnails', label: 'Titles & Thumbnails', icon: Lightbulb },
                  { id: 'calendar', label: '7-Day Schedule', icon: Calendar },
                  { id: 'strategy', label: 'Strategic Playbook', icon: TrendingUp },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Captions & Hashtags */}
              {activeTab === 'captions' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Caption Variations (Tested for Retention)
                    </h3>
                    {result.captions.map((cap, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-400">{cap.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 font-mono text-[11px]">
                              {cap.characterCount} chars
                            </span>
                            <button
                              onClick={() => copyToClipboard(cap.text, `cap_${idx}`)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                            >
                              {copiedKey === `cap_${idx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handlePushToCalendar(cap.text, result.videoHooks[0]?.hook || '')}
                              className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs flex items-center gap-1"
                              title="Send to Content Calendar"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Schedule</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                          {cap.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Hashtags Clusters */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Curated Hashtags (Low, Mid & High Volume)</span>
                      </h4>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            result.hashtags.recommended.join(' '),
                            'tags'
                          )
                        }
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedKey === 'tags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy All Tags</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {result.hashtags.recommended.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 cursor-pointer"
                          onClick={() => copyToClipboard(tag, tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Video Hooks & Script */}
              {activeTab === 'script' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      First 3-Second Retention Hooks
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {result.videoHooks.map((h, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                              {h.type}
                            </span>
                            <p className="mt-1 text-xs font-semibold text-white leading-snug">
                              &ldquo;{h.hook}&rdquo;
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-800/80">
                            {h.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.videoScript && (
                    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Video className="w-4 h-4 text-emerald-400" />
                          <span>Full 35-Second Video Production Script</span>
                        </h4>
                        <span className="text-xs text-indigo-400 font-mono">
                          Duration: {result.videoScript.duration}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        {result.videoScript.bodyPoints.map((point, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                              <span className="text-emerald-400 font-bold">{point.timecode}</span>
                              <span className="text-slate-400 italic">Visual Cue: {point.visualCue}</span>
                            </div>
                            <p className="text-slate-200 font-medium pl-2 border-l-2 border-indigo-500">
                              &ldquo;{point.spokenAudio}&rdquo;
                            </p>
                          </div>
                        ))}

                        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                          <strong className="text-xs uppercase font-bold text-indigo-300 block mb-1">
                            Closing Call-To-Action:
                          </strong>
                          <span>{result.videoScript.callToAction}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Titles & Thumbnails */}
              {activeTab === 'thumbnails' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    High-CTR Title Variations & Visual Thumbnail Briefs
                  </h3>

                  <div className="space-y-3">
                    {result.thumbnailTitles?.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{t.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {t.ctrScore}% CTR Score
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            <strong>Visual Concept:</strong> {t.thumbnailVisualDescription}
                          </p>
                        </div>

                        <button
                          onClick={() => copyToClipboard(t.title, `title_${idx}`)}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          {copiedKey === `title_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy Title</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: 7-Day Content Schedule */}
              {activeTab === 'calendar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Weekly Algorithmic Content Cadence
                    </h3>
                    <span className="text-xs text-slate-400">Optimized for consistent organic distribution</span>
                  </div>

                  <div className="space-y-3">
                    {result.contentCalendarWeek?.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-400">{slot.day}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300 font-mono">{slot.suggestedTime}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {slot.format}
                            </span>
                          </div>
                          <p className="text-slate-200">
                            <strong>Angle:</strong> {slot.angle}
                          </p>
                          <p className="text-slate-400 italic">
                            Sample Hook: &ldquo;{slot.sampleHook}&rdquo;
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handlePushToCalendar(
                              slot.sampleHook,
                              `[${slot.format}] ${slot.angle}`
                            )
                          }
                          className="shrink-0 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Add to Calendar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Strategic Playbook */}
              {activeTab === 'strategy' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Tailored Content Improvement Rules
                  </h3>
                  <div className="space-y-3">
                    {result.strategicImprovements.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-200 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 rounded-2xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Ready to Generate Viral Organic Assets</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Configure your target platform, niche, and topic on the left to produce 3-second visual hooks, full production scripts, and tested hashtag clusters.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                Generate Initial Batch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
