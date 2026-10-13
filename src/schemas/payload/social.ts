import { z } from 'zod';
import { normalizeWebUrl } from './shared';

export type SocialPlatform =
  | 'instagram'
  | 'x'
  | 'linkedin'
  | 'youtube'
  | 'facebook'
  | 'tiktok'
  | 'github'
  | 'custom';

export interface SocialPayloadInput {
  platform: SocialPlatform;
  input: string;
}

const PLATFORM_RULES: Record<
  Exclude<SocialPlatform, 'custom'>,
  {
    name: string;
    allowedHosts: string[];
    handleRegex: RegExp;
    handleError: string;
    buildUrl: (handle: string) => string;
    extractHandleFromPath: (pathname: string) => string | null;
  }
> = {
  instagram: {
    name: 'Instagram',
    allowedHosts: ['instagram.com', 'www.instagram.com'],
    handleRegex: /^[a-zA-Z0-9._]{1,30}$/,
    handleError: 'Instagram handle must be 1-30 characters (letters, numbers, periods, underscores)',
    buildUrl: (h) => `https://instagram.com/${h}/`,
    extractHandleFromPath: (path) => {
      const match = path.match(/^\/([a-zA-Z0-9._]{1,30})\/?$/);
      return match ? match[1] : null;
    },
  },
  x: {
    name: 'X (Twitter)',
    allowedHosts: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
    handleRegex: /^[a-zA-Z0-9_]{1,15}$/,
    handleError: 'X/Twitter handle must be 1-15 characters (letters, numbers, underscores)',
    buildUrl: (h) => `https://x.com/${h}`,
    extractHandleFromPath: (path) => {
      const match = path.match(/^\/([a-zA-Z0-9_]{1,15})\/?$/);
      return match ? match[1] : null;
    },
  },
  linkedin: {
    name: 'LinkedIn',
    allowedHosts: ['linkedin.com', 'www.linkedin.com'],
    handleRegex: /^[a-zA-Z0-9_-]{3,100}$/,
    handleError: 'LinkedIn profile slug must be 3-100 characters',
    buildUrl: (h) => `https://linkedin.com/in/${h}/`,
    extractHandleFromPath: (path) => {
      const match = path.match(/^\/in\/([a-zA-Z0-9_-]{3,100})\/?$/);
      return match ? match[1] : null;
    },
  },
  youtube: {
    name: 'YouTube',
    allowedHosts: ['youtube.com', 'www.youtube.com'],
    handleRegex: /^[a-zA-Z0-9._-]{3,30}$/,
    handleError: 'YouTube handle must be 3-30 characters',
    buildUrl: (h) => `https://youtube.com/@${h}`,
    extractHandleFromPath: (path) => {
      const match = path.match(/^\/@?([a-zA-Z0-9._-]{3,30})\/?$/);
      return match ? match[1] : null;
    },
  },
  facebook: {
    name: 'Facebook',
    allowedHosts: ['facebook.com', 'www.facebook.com'],
    handleRegex: /^[a-zA-Z0-9.]{5,50}$/,
    handleError: 'Facebook username must be 5-50 characters',
    buildUrl: (h) => `https://facebook.com/${h}`,
    extractHandleFromPath: (path) => {
      const match = path.match(/^\/([a-zA-Z0-9.]{5,50})\/?$/);
      return match ? match[1] : null;
    },
  },
  tiktok: {
    name: 'TikTok',
    allowedHosts: ['tiktok.com', 'www.tiktok.com'],
    handleRegex: /^[a-zA-Z0-9._]{2,24}$/,
    handleError: 'TikTok handle must be 2-24 characters',
    buildUrl: (h) => `https://tiktok.com/@${h}`,
    extractHandleFromPath: (path) => {
      const match = path.match(/^\/@?([a-zA-Z0-9._]{2,24})\/?$/);
      return match ? match[1] : null;
    },
  },
  github: {
    name: 'GitHub',
    allowedHosts: ['github.com', 'www.github.com'],
    handleRegex: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
    handleError: 'GitHub username must be 1-39 characters, alphanumeric with single hyphens',
    buildUrl: (h) => `https://github.com/${h}`,
    extractHandleFromPath: (path) => {
      const match = path.match(/^\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\/?$/);
      return match ? match[1] : null;
    },
  },
};

export const socialPayloadSchema = z
  .object({
    platform: z.enum([
      'instagram',
      'x',
      'linkedin',
      'youtube',
      'facebook',
      'tiktok',
      'github',
      'custom',
    ]),
    input: z
      .string()
      .trim()
      .min(1, 'Please enter a profile username or URL')
      .max(2048, 'Input exceeds maximum length of 2048 characters'),
  })
  .transform(({ platform, input }, ctx) => {
    if (platform === 'custom') {
      try {
        return normalizeWebUrl(input, false);
      } catch (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err instanceof Error ? err.message : 'Invalid URL format',
        });
        return z.NEVER;
      }
    }

    const rule = PLATFORM_RULES[platform];
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input);

    // If input is a full URL, verify host and extract handle
    if (hasScheme || input.includes('.com') || input.includes('/')) {
      let parsed: URL;
      try {
        parsed = new URL(hasScheme ? input : `https://${input}`);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Please enter a valid ${rule.name} profile URL or username`,
        });
        return z.NEVER;
      }

      const hostname = parsed.hostname.toLowerCase();
      if (!rule.allowedHosts.includes(hostname)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `URL host "${parsed.hostname}" does not belong to ${rule.name}`,
        });
        return z.NEVER;
      }

      const extracted = rule.extractHandleFromPath(parsed.pathname);
      if (!extracted || !rule.handleRegex.test(extracted)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unable to extract a valid ${rule.name} profile identifier from URL`,
        });
        return z.NEVER;
      }

      return rule.buildUrl(extracted);
    }

    // Direct handle input: strip leading @ if present
    const cleanHandle = input.startsWith('@') ? input.slice(1) : input;
    if (!rule.handleRegex.test(cleanHandle)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rule.handleError,
      });
      return z.NEVER;
    }

    return rule.buildUrl(cleanHandle);
  });

export type SocialPayloadOutput = z.infer<typeof socialPayloadSchema>;
