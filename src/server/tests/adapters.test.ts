import test from 'node:test';
import assert from 'node:assert/strict';
import { platformRegistry } from '../adapters/registry.ts';
import { validateSocialUrlSafety } from '../auth/auth.ts';

test('PlatformRegistry extracts Instagram username correctly from various formats', () => {
  const adapter = platformRegistry.getAdapter('instagram');
  assert.equal(adapter.extractHandle('natgeo'), 'natgeo');
  assert.equal(adapter.extractHandle('@natgeo'), 'natgeo');
  assert.equal(adapter.extractHandle('https://www.instagram.com/natgeo/'), 'natgeo');
  assert.equal(adapter.extractHandle('https://instagram.com/mkbhd?igsh=123'), 'mkbhd');
});

test('PlatformRegistry extracts YouTube handle from handle and channel URLs', () => {
  const adapter = platformRegistry.getAdapter('youtube');
  assert.equal(adapter.extractHandle('mkbhd'), 'mkbhd');
  assert.equal(adapter.extractHandle('@mkbhd'), 'mkbhd');
  assert.equal(adapter.extractHandle('https://www.youtube.com/@mkbhd'), 'mkbhd');
  assert.equal(adapter.extractHandle('https://youtube.com/c/Veritasium'), 'Veritasium');
});

test('PlatformRegistry extracts TikTok handle', () => {
  const adapter = platformRegistry.getAdapter('tiktok');
  assert.equal(adapter.extractHandle('charlidamelio'), 'charlidamelio');
  assert.equal(adapter.extractHandle('@charlidamelio'), 'charlidamelio');
  assert.equal(adapter.extractHandle('https://www.tiktok.com/@charlidamelio'), 'charlidamelio');
});

test('PlatformRegistry detects platform from URL automatically', () => {
  const yt = platformRegistry.detectPlatformAndHandle('https://www.youtube.com/@mkbhd');
  assert.equal(yt.platform, 'youtube');
  assert.equal(yt.handle, 'mkbhd');

  const ig = platformRegistry.detectPlatformAndHandle('https://instagram.com/natgeo');
  assert.equal(ig.platform, 'instagram');
  assert.equal(ig.handle, 'natgeo');

  const x = platformRegistry.detectPlatformAndHandle('https://x.com/levelsio');
  assert.equal(x.platform, 'x_twitter');
  assert.equal(x.handle, 'levelsio');
});

test('SSRF validator blocks private IP addresses and internal domains', () => {
  assert.equal(validateSocialUrlSafety('http://localhost:8080').isSafe, false);
  assert.equal(validateSocialUrlSafety('http://127.0.0.1/admin').isSafe, false);
  assert.equal(validateSocialUrlSafety('http://169.254.169.254/latest/meta-data/').isSafe, false);
  assert.equal(validateSocialUrlSafety('http://192.168.1.1').isSafe, false);
  assert.equal(validateSocialUrlSafety('https://attacker.com/profile').isSafe, false);

  assert.equal(validateSocialUrlSafety('https://www.instagram.com/natgeo').isSafe, true);
  assert.equal(validateSocialUrlSafety('https://youtube.com/@mkbhd').isSafe, true);
});
