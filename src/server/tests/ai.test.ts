import test from 'node:test';
import assert from 'node:assert/strict';
import { aiContentService } from '../ai/gemini.ts';

test('AI content assistant generates structured captions, hooks, and hashtags', async () => {
  const result = await aiContentService.generate({
    platform: 'instagram',
    niche: 'Fitness & Nutrition',
    topic: 'How to calculate your maintenance calories',
    targetAudience: 'Busy professionals',
    tone: 'Encouraging and science-backed',
  });

  assert.ok(result.captions.length >= 3, 'Must provide at least 3 caption variations');
  assert.ok(result.videoHooks.length >= 3, 'Must provide at least 3 video hooks');
  assert.ok(result.hashtags.recommended.length > 0, 'Must provide recommended hashtags');
  assert.ok(result.videoScript, 'Must provide full video script');
  assert.ok(result.strategicImprovements.length > 0, 'Must provide strategic recommendations');
});
