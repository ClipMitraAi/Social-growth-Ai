import { GoogleGenAI } from '@google/genai';

export interface GenerateContentParams {
  platform: 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'x_twitter';
  niche: string;
  topic: string;
  targetAudience: string;
  tone: string;
  language?: string;
  contentType?: 'caption_hashtags' | 'video_hook_script' | 'content_calendar' | 'thumbnail_titles' | 'audit_recommendations';
}

export interface GeneratedContentResult {
  captions: Array<{ label: string; text: string; characterCount: number }>;
  hashtags: {
    recommended: string[];
    highReach: string[];
    nicheSpecific: string[];
  };
  videoHooks: Array<{ type: string; hook: string; explanation: string }>;
  videoScript?: {
    duration: string;
    hook: string;
    bodyPoints: Array<{ timecode: string; visualCue: string; spokenAudio: string }>;
    callToAction: string;
  };
  thumbnailTitles?: Array<{ title: string; ctrScore: number; thumbnailVisualDescription: string }>;
  contentCalendarWeek?: Array<{
    day: string;
    suggestedTime: string;
    format: string;
    angle: string;
    sampleHook: string;
  }>;
  strategicImprovements: string[];
  providerUsed: 'gemini-3.8-flash' | 'intelligent-offline-engine';
  isFallback: boolean;
}

export class AiContentService {
  private genAI: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenAI();
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generate(params: GenerateContentParams, customApiKey?: string): Promise<GeneratedContentResult> {
    const { platform, niche, topic, targetAudience, tone, language = 'en' } = params;

    if (!topic || !niche) {
      throw new Error('Topic and niche are required for AI generation');
    }

    const client = customApiKey ? new GoogleGenAI({ apiKey: customApiKey }) : this.genAI;

    if (client) {
      try {
        const systemPrompt = `You are the lead social growth strategist and viral copywriter for ${platform}.
Generate high-converting, organic social content for the following brief:
- Platform: ${platform}
- Niche: ${niche}
- Topic: ${topic}
- Target Audience: ${targetAudience}
- Desired Tone: ${tone}
- Language: ${language}

You must respond ONLY with a single valid JSON object strictly matching this schema:
{
  "captions": [
    {"label": "Punchy Hook", "text": "...", "characterCount": 120},
    {"label": "Storytelling & Value", "text": "...", "characterCount": 280},
    {"label": "Direct Question / Engagement", "text": "...", "characterCount": 160}
  ],
  "hashtags": {
    "recommended": ["#tag1", "#tag2", "#tag3"],
    "highReach": ["#broad1", "#broad2"],
    "nicheSpecific": ["#niche1", "#niche2", "#niche3"]
  },
  "videoHooks": [
    {"type": "Contrarian / Curiosity", "hook": "...", "explanation": "..."},
    {"type": "Pain Point & Solution", "hook": "...", "explanation": "..."},
    {"type": "Immediate Demonstration", "hook": "...", "explanation": "..."}
  ],
  "videoScript": {
    "duration": "30-45 seconds",
    "hook": "...",
    "bodyPoints": [
      {"timecode": "0:00 - 0:03", "visualCue": "...", "spokenAudio": "..."},
      {"timecode": "0:03 - 0:25", "visualCue": "...", "spokenAudio": "..."},
      {"timecode": "0:25 - 0:35", "visualCue": "...", "spokenAudio": "..."}
    ],
    "callToAction": "..."
  },
  "thumbnailTitles": [
    {"title": "...", "ctrScore": 94, "thumbnailVisualDescription": "..."},
    {"title": "...", "ctrScore": 91, "thumbnailVisualDescription": "..."}
  ],
  "contentCalendarWeek": [
    {"day": "Monday", "suggestedTime": "11:30 AM", "format": "Short / Reel", "angle": "...", "sampleHook": "..."},
    {"day": "Wednesday", "suggestedTime": "2:00 PM", "format": "Carousel / Thread", "angle": "...", "sampleHook": "..."},
    {"day": "Friday", "suggestedTime": "6:30 PM", "format": "Long-form / Deep Dive", "angle": "...", "sampleHook": "..."}
  ],
  "strategicImprovements": [
    "...",
    "...",
    "..."
  ]
}`;

        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return {
            ...parsed,
            providerUsed: 'gemini-3.8-flash',
            isFallback: false,
          };
        }
      } catch (apiError) {
        console.warn('Gemini API call failed or returned unparseable response, using intelligent fallback:', apiError);
      }
    }

    // High quality offline fallback engine
    return this.generateOfflineFallback(params);
  }

  private generateOfflineFallback(params: GenerateContentParams): GeneratedContentResult {
    const { platform, niche, topic, targetAudience, tone } = params;

    const formattedNiche = niche.toLowerCase();
    const cleanTopic = topic.trim();

    return {
      captions: [
        {
          label: 'High-Impact Hook',
          text: `Most people in ${niche} are approaching ${cleanTopic} completely backwards. Here is what actually delivers results in 2026—without burning out or paying for ads. 👇`,
          characterCount: 165,
        },
        {
          label: 'Deep Value & Storytelling',
          text: `When I first tackled ${cleanTopic}, I made the classic beginner mistake: focusing on volume over retention. \n\nHere are the 3 structural shifts that changed everything for our audience of ${targetAudience}:\n1. Clear contrast in the first 3 seconds.\n2. One concrete insight per post instead of surface lists.\n3. A frictionless next step.\n\nSave this post for your next content sprint! 📌`,
          characterCount: 385,
        },
        {
          label: 'Conversational & Engagement Prompt',
          text: `Quick poll for fellow ${niche} creators: What is your #1 bottleneck when executing on ${cleanTopic}? Drop your current workflow below—I'll review and reply to every comment with a custom tip. 💬`,
          characterCount: 198,
        },
      ],
      hashtags: {
        recommended: [
          `#${formattedNiche.replace(/[^a-z0-9]/g, '')}`,
          '#organicgrowth',
          '#contentcreators',
          '#growthstrategy',
        ],
        highReach: ['#socialgrowth', '#contentstrategy', '#creatorgrowth'],
        nicheSpecific: [
          `#${cleanTopic.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}tips`,
          `#${formattedNiche.replace(/[^a-z0-9]/g, '')}daily`,
          '#socialmediatips2026',
        ],
      },
      videoHooks: [
        {
          type: 'Contrarian Pattern Interrupt',
          hook: `Stop doing ${cleanTopic} the way you were taught in 2024. Here is why it hurts your reach today.`,
          explanation: 'Challenges industry orthodoxy immediately, forcing viewers to stop scrolling.',
        },
        {
          type: 'Pain Point / Result Promise',
          hook: `If you are trying to reach ${targetAudience}, this 1-minute tweak to ${cleanTopic} will double your retention.`,
          explanation: 'Targets the ideal audience avatar directly and promises immediate value.',
        },
        {
          type: 'Behind-The-Scenes Proof',
          hook: `I tested 5 different approaches to ${cleanTopic}. Only ONE produced consistent organic distribution.`,
          explanation: 'Builds curiosity around a verified experiment rather than a generic opinion.',
        },
      ],
      videoScript: {
        duration: '35 seconds',
        hook: `If you want to scale in ${niche}, you need to understand this single rule about ${cleanTopic}.`,
        bodyPoints: [
          {
            timecode: '0:00 - 0:04',
            visualCue: 'Fast cut to camera, pointing directly at on-screen screenshot with key metric highlighted.',
            spokenAudio: `If you want to scale in ${niche}, here is the honest truth about ${cleanTopic} that nobody talks about.`,
          },
          {
            timecode: '0:04 - 0:24',
            visualCue: 'B-roll or screen recording demonstrating step 1 and step 2 in fast 2x speed with text callouts.',
            spokenAudio: `First, identify the exact question ${targetAudience} is searching at midnight. Second, answer it within 10 seconds before introducing your framework.`,
          },
          {
            timecode: '0:24 - 0:35',
            visualCue: 'Back to creator. Subtitle highlights call to action.',
            spokenAudio: `Want the full template checklist? Comment 'STRATEGY' below and I'll send you the direct resource link.`,
          },
        ],
        callToAction: 'Follow for daily organic growth playbooks & comment for the full breakdown.',
      },
      thumbnailTitles: [
        {
          title: `Why ${cleanTopic} is Broken (And How to Fix It)`,
          ctrScore: 94,
          thumbnailVisualDescription: 'Bold red cross over outdated method, green checkmark next to streamlined modern blueprint.',
        },
        {
          title: `The 2026 Blueprint for ${cleanTopic}`,
          ctrScore: 91,
          thumbnailVisualDescription: 'Split screen comparing 0 views vs 50K views with high contrast text "STOP DOING THIS".',
        },
        {
          title: `How I Mastered ${cleanTopic} in 7 Days`,
          ctrScore: 88,
          thumbnailVisualDescription: 'Creator looking intently at screen with magnified graph trending sharply upward.',
        },
      ],
      contentCalendarWeek: [
        {
          day: 'Monday',
          suggestedTime: '11:30 AM EST',
          format: 'Reel / Short',
          angle: 'Contrarian Hook & Framework',
          sampleHook: `Why 90% fail at ${cleanTopic} in their first 30 days.`,
        },
        {
          day: 'Wednesday',
          suggestedTime: '2:15 PM EST',
          format: 'Step-by-Step Carousel',
          angle: 'Actionable Tactical Tutorial',
          sampleHook: `The 5-step checklist for ${cleanTopic} every creator needs.`,
        },
        {
          day: 'Friday',
          suggestedTime: '6:45 PM EST',
          format: 'Community Discussion',
          angle: 'Case Study / Lessons Learned',
          sampleHook: `The biggest lesson I learned this week testing ${cleanTopic}.`,
        },
      ],
      strategicImprovements: [
        `Tailor visual hooks specifically to ${targetAudience} by addressing their top daily frustration in the first 2 seconds.`,
        `Maintain a consistent posting window on ${platform} to establish algorithmic habituation.`,
        `Pin the top community comment and link back to your previous highest-performing piece of content.`,
      ],
      providerUsed: 'intelligent-offline-engine',
      isFallback: true,
    };
  }
}

export const aiContentService = new AiContentService();
