import { Router, Response } from 'express';
import {
  db,
  hashPassword,
  verifyPassword,
} from './db/store.ts';
import {
  AuthenticatedRequest,
  optionalAuthMiddleware,
  requireAuthMiddleware,
  requireAdminMiddleware,
  rateLimitGuard,
  validateSocialUrlSafety,
} from './auth/auth.ts';
import { platformRegistry } from './adapters/registry.ts';
import { PlatformType } from './adapters/types.ts';
import { aiContentService } from './ai/gemini.ts';

export const apiRouter = Router();

// --- AUTH ROUTES ---

apiRouter.post('/auth/register', rateLimitGuard(), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const user = db.createUser({
      email,
      name,
      passwordHash: hashPassword(password),
      role: 'USER',
      tier: 'FREE',
    });

    const session = db.createSession(user.id, req.ip, req.headers['user-agent']);
    db.logAuditEvent({
      userId: user.id,
      action: 'AUTH_REGISTER',
      resource: user.email,
      ipAddress: req.ip,
      status: 'success',
    });

    const quota = db.getQuota(user.id);
    const pref = db.getUserPreferences(user.id);

    res.cookie('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: session.token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier },
      quota,
      preferences: pref,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

apiRouter.post('/auth/login', rateLimitGuard(), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      db.logAuditEvent({
        action: 'AUTH_LOGIN_FAILED',
        resource: email,
        ipAddress: req.ip,
        status: 'failed',
      });
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const session = db.createSession(user.id, req.ip, req.headers['user-agent']);
    db.logAuditEvent({
      userId: user.id,
      action: 'AUTH_LOGIN',
      resource: user.email,
      ipAddress: req.ip,
      status: 'success',
    });

    const quota = db.getQuota(user.id);
    const pref = db.getUserPreferences(user.id);

    res.cookie('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: session.token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier },
      quota,
      preferences: pref,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

apiRouter.post('/auth/demo-login', rateLimitGuard(), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.body; // 'admin' or 'creator'
    const targetEmail = role === 'admin' ? 'admin@socialgrowth.ai' : 'creator@socialgrowth.ai';
    const user = db.getUserByEmail(targetEmail);
    if (!user) {
      res.status(404).json({ error: 'Demo user not found.' });
      return;
    }

    const session = db.createSession(user.id, req.ip, req.headers['user-agent']);
    const quota = db.getQuota(user.id);
    const pref = db.getUserPreferences(user.id);

    res.cookie('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: session.token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier },
      quota,
      preferences: pref,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Demo login failed.' });
  }
});

apiRouter.post('/auth/logout', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.sessionToken) {
    db.deleteSession(req.sessionToken);
  }
  res.clearCookie('session_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }
  const quota = db.getQuota(req.user.id);
  const pref = db.getUserPreferences(req.user.id);
  res.json({
    user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role, tier: req.user.tier },
    quota,
    preferences: pref,
  });
});

apiRouter.post('/auth/reset-password', rateLimitGuard(), (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }
  // In production, an email with a secure token link is dispatched.
  res.json({
    success: true,
    message: 'If an account exists with this email, password recovery instructions have been sent.',
  });
});

apiRouter.delete('/auth/delete-account', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  db.logAuditEvent({
    userId,
    action: 'DELETE_ACCOUNT',
    resource: req.user!.email,
    ipAddress: req.ip,
    status: 'success',
  });
  db.deleteUser(userId);
  res.clearCookie('session_token');
  res.json({ success: true, message: 'Account and all associated records have been permanently deleted.' });
});

// --- PROFILE AUDIT & SEARCH ---

apiRouter.post('/profiles/audit', rateLimitGuard(true), optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platform: explicitPlatform, input } = req.body;
    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: 'Please provide a username or profile URL.' });
      return;
    }

    // SSRF validation if input is a URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const urlCheck = validateSocialUrlSafety(input);
      if (!urlCheck.isSafe) {
        res.status(400).json({ error: urlCheck.error || 'Invalid or unauthorized URL.' });
        return;
      }
    }

    // Check user quota if logged in
    let userId = req.user?.id;
    if (userId) {
      const quotaCheck = db.incrementQuota(userId, 'audit');
      if (!quotaCheck.allowed) {
        res.status(429).json({
          error: 'Daily audit limit reached for your plan tier. Please upgrade or try again tomorrow.',
          quota: quotaCheck.quota,
        });
        return;
      }
    }

    // Auto-detect platform or use specified
    const detected = platformRegistry.detectPlatformAndHandle(input, explicitPlatform as PlatformType);
    const auditResult = await platformRegistry.audit(detected.platform, detected.handle);

    db.logAuditEvent({
      userId,
      action: 'AUDIT_PROFILE',
      resource: `${detected.platform}:${detected.handle}`,
      ipAddress: req.ip,
      status: 'success',
      details: {
        platform: detected.platform,
        handle: detected.handle,
        followers: auditResult.metrics.followers.value,
        engagementRate: auditResult.metrics.engagementRate.value,
      },
    });

    res.json({
      success: true,
      data: auditResult,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to audit profile.' });
  }
});

apiRouter.get('/profiles/saved', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const profiles = db.getSavedProfiles(req.user!.id);
  res.json({ profiles });
});

apiRouter.post('/profiles/save', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platform, handle, profileUrl, displayName, avatarUrl, bio, followersCount, followingCount, postsCount, engagementRate, notes, tags } = req.body;
    if (!platform || !handle) {
      res.status(400).json({ error: 'Platform and handle are required.' });
      return;
    }
    const saved = db.saveProfile({
      userId: req.user!.id,
      platform,
      handle,
      profileUrl: profileUrl || `https://${platform}.com/${handle}`,
      displayName: displayName || handle,
      avatarUrl,
      bio,
      followersCount: followersCount || 0,
      followingCount: followingCount || 0,
      postsCount: postsCount || 0,
      engagementRate: engagementRate || 0,
      notes,
      tags: tags || [],
      lastAuditedAt: new Date().toISOString(),
    });
    res.json({ success: true, profile: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save profile.' });
  }
});

apiRouter.delete('/profiles/saved/:id', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteSavedProfile(req.params.id, req.user!.id);
  if (!success) {
    res.status(404).json({ error: 'Saved profile not found.' });
    return;
  }
  res.json({ success: true });
});

// --- AI CONTENT ASSISTANT ---

apiRouter.post('/ai/generate', rateLimitGuard(true), optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platform, niche, topic, targetAudience, tone, language, contentType } = req.body;

    if (!topic || !niche) {
      res.status(400).json({ error: 'Topic and niche are required for AI generation.' });
      return;
    }

    const userId = req.user?.id;
    if (userId) {
      const quotaCheck = db.incrementQuota(userId, 'ai');
      if (!quotaCheck.allowed) {
        res.status(429).json({
          error: 'Daily AI generation limit reached for your plan tier. Please upgrade or try again tomorrow.',
          quota: quotaCheck.quota,
        });
        return;
      }
    }

    const result = await aiContentService.generate({
      platform: platform || 'instagram',
      niche,
      topic,
      targetAudience: targetAudience || 'Content creators and industry professionals',
      tone: tone || 'Engaging and educational',
      language: language || 'en',
      contentType,
    });

    db.logAuditEvent({
      userId,
      action: 'AI_GENERATE',
      resource: `${platform}:${niche}`,
      ipAddress: req.ip,
      status: 'success',
      details: { topic, providerUsed: result.providerUsed },
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI generation failed.' });
  }
});

apiRouter.get('/ai/ideas', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const ideas = db.getContentIdeas(req.user!.id);
  res.json({ ideas });
});

apiRouter.post('/ai/ideas', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platform, niche, topic, title, hook, script, captions, hashtags, score } = req.body;
    const idea = db.saveContentIdea({
      userId: req.user!.id,
      platform: platform || 'instagram',
      niche: niche || 'General',
      topic: topic || 'New Post',
      title: title || 'Idea Title',
      hook: hook || '',
      script,
      captions: captions || [],
      hashtags: hashtags || [],
      score: score || 85,
      isFavorited: false,
    });
    res.json({ success: true, idea });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save content idea.' });
  }
});

apiRouter.delete('/ai/ideas/:id', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteContentIdea(req.params.id, req.user!.id);
  if (!success) {
    res.status(404).json({ error: 'Content idea not found.' });
    return;
  }
  res.json({ success: true });
});

// --- CONTENT CALENDAR ---

apiRouter.get('/calendar', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const entries = db.getCalendarEntries(req.user!.id);
  res.json({ entries });
});

apiRouter.post('/calendar', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platform, scheduledTime, caption, hashtags, mediaType, notes, status } = req.body;
    if (!platform || !scheduledTime || !caption) {
      res.status(400).json({ error: 'Platform, scheduled time, and caption are required.' });
      return;
    }
    const entry = db.createCalendarEntry({
      userId: req.user!.id,
      platform,
      scheduledTime,
      caption,
      hashtags: hashtags || [],
      mediaType: mediaType || 'reel',
      status: status || 'SCHEDULED',
      reminderSent: false,
      notes,
    });
    res.json({ success: true, entry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create calendar entry.' });
  }
});

apiRouter.patch('/calendar/:id', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateCalendarEntry(req.params.id, req.user!.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Calendar entry not found.' });
    return;
  }
  res.json({ success: true, entry: updated });
});

apiRouter.delete('/calendar/:id', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCalendarEntry(req.params.id, req.user!.id);
  if (!success) {
    res.status(404).json({ error: 'Calendar entry not found.' });
    return;
  }
  res.json({ success: true });
});

// --- USER PREFERENCES ---

apiRouter.put('/preferences', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateUserPreferences(req.user!.id, req.body);
  res.json({ success: true, preferences: updated });
});

// --- ADMIN PORTAL ---

apiRouter.get('/admin/health', requireAdminMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'CONNECTED_LOCAL_STORAGE',
    aiServiceStatus: aiContentService.isConfigured() ? 'CONFIGURED' : 'OFFLINE_FALLBACK_ACTIVE',
  });
});

apiRouter.get('/admin/stats', requireAdminMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const stats = db.getSystemStats();
  res.json({ stats });
});

apiRouter.get('/admin/platforms', requireAdminMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const platforms = platformRegistry.getIntegrationsStatus();
  res.json({ platforms });
});

apiRouter.get('/admin/logs', requireAdminMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditEvents(100);
  res.json({ logs });
});
