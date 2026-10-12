import { z } from 'zod';

// ============================================================================
// Shared URL Validation Utility
// ============================================================================

/**
 * Validates and normalizes HTTP and HTTPS web URLs.
 * Automatically prepends https:// if scheme is omitted.
 * Preserves query parameters, tokens, and fragment hashes.
 */
export function normalizeWebUrl(val: string, requireHttps = false): string {
  const trimmed = val.trim();
  if (!trimmed) {
    throw new Error('Please enter a website URL');
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('Please enter a valid website URL (e.g. example.com or https://example.com)');
  }

  const allowedProtocols = requireHttps ? ['https:'] : ['http:', 'https:'];
  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new Error(
      requireHttps
        ? 'Only secure HTTPS URLs are supported'
        : 'Only HTTP and HTTPS web URLs are supported'
    );
  }

  // Reject empty or invalid hostnames
  if (
    !parsed.hostname ||
    parsed.hostname.startsWith('.') ||
    (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')
  ) {
    throw new Error('Please enter a valid website hostname');
  }

  return parsed.toString();
}

// ============================================================================
// 1. Link & Text Schemas (Sub-phase 2.2 Foundation)
// ============================================================================

export const linkPayloadSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a website URL')
  .max(2048, 'URL exceeds maximum length of 2048 characters')
  .transform((val, ctx) => {
    try {
      return normalizeWebUrl(val, false);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : 'Invalid URL format',
      });
      return z.NEVER;
    }
  });

export type LinkPayloadOutput = z.infer<typeof linkPayloadSchema>;

export const textPayloadSchema = z
  .string()
  .refine((val) => val.trim().length > 0, {
    message: 'Please enter text to generate a QR code',
  })
  .refine((val) => val.length <= 1000, {
    message: 'Text exceeds maximum product limit of 1000 characters for QR studio preview',
  });

export type TextPayloadOutput = z.infer<typeof textPayloadSchema>;

// ============================================================================
// 2. WhatsApp Payload Schema
// ============================================================================

export interface WhatsAppPayloadInput {
  phone: string;
  message?: string;
}

/**
 * WhatsApp QR Schema
 * Note: Syntax validation establishes formatting compliance with E.164-compatible
 * digits. It does NOT establish that a phone number actually exists or is registered with WhatsApp.
 */
export const whatsappPayloadSchema = z
  .object({
    phone: z
      .string()
      .trim()
      .min(1, 'Please enter a phone number with country code')
      // Reject letters and unsupported symbols; allow spaces, parens, hyphens, and optional leading plus
      .refine((val) => /^(\+)?[\d\s\-()]+$/.test(val), {
        message: 'Phone number can only contain digits, spaces, parentheses, hyphens, and an optional leading plus (+)',
      })
      .transform((val, ctx) => {
        const digits = val.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number must contain between 7 and 15 digits including country code',
          });
          return z.NEVER;
        }
        if (digits.startsWith('0')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'International phone numbers must not start with a leading zero (0)',
          });
          return z.NEVER;
        }
        return digits;
      }),
    message: z
      .string()
      .max(500, 'Pre-filled message cannot exceed 500 characters')
      .optional()
      .default(''),
  })
  .transform(({ phone, message }) => {
    const trimmedMessage = message ? message.trim() : '';
    if (!trimmedMessage) {
      return `https://wa.me/${phone}`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(trimmedMessage)}`;
  });

export type WhatsAppPayloadOutput = z.infer<typeof whatsappPayloadSchema>;

// ============================================================================
// 3. Social Media Payload Schema
// ============================================================================

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
    input: z.string().trim().min(1, 'Please enter a profile username or URL'),
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

// ============================================================================
// 4. Map Address Payload Schema
// ============================================================================

export interface MapAddressInput {
  mode: 'address';
  query: string;
}

export interface MapCoordinatesInput {
  mode: 'coordinates';
  latitude: number;
  longitude: number;
}

export type MapPayloadInput = MapAddressInput | MapCoordinatesInput;

export const mapPayloadSchema = z
  .discriminatedUnion('mode', [
    z.object({
      mode: z.literal('address'),
      query: z
        .string()
        .trim()
        .min(1, 'Please enter a location address or place name')
        .max(300, 'Address query cannot exceed 300 characters'),
    }),
    z.object({
      mode: z.literal('coordinates'),
      latitude: z
        .number({ invalid_type_error: 'Latitude must be a valid number' })
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
      longitude: z
        .number({ invalid_type_error: 'Longitude must be a valid number' })
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
    }),
  ])
  .transform((data) => {
    const url = new URL('https://www.google.com/maps/search/');
    url.searchParams.set('api', '1');

    if (data.mode === 'address') {
      url.searchParams.set('query', data.query);
      return url.toString();
    }

    // Deterministic formatting with up to 6 decimal places without precision rounding out-of-bounds
    const latStr = parseFloat(data.latitude.toFixed(6)).toString();
    const lngStr = parseFloat(data.longitude.toFixed(6)).toString();
    url.searchParams.set('query', `${latStr},${lngStr}`);
    return url.toString();
  });

export type MapPayloadOutput = z.infer<typeof mapPayloadSchema>;

// ============================================================================
// 5. Coupon Payload Schema
// ============================================================================

export interface CouponPayloadInput {
  code: string;
  description: string;
  terms?: string;
  redeemUrl?: string;
}

export const couponPayloadSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Please enter a coupon code')
      .max(32, 'Coupon code cannot exceed 32 characters')
      .transform((val) => val.toUpperCase())
      .refine((val) => /^[A-Z0-9_-]{1,32}$/.test(val), {
        message: 'Coupon code can only contain uppercase letters, numbers, hyphens, and underscores',
      }),
    description: z
      .string()
      .trim()
      .min(1, 'Please enter an offer description')
      .max(100, 'Description cannot exceed 100 characters')
      // Normalize internal line breaks to avoid multi-line corruption
      .transform((val) => val.replace(/[\r\n]+/g, ' ').trim()),
    terms: z
      .string()
      .max(200, 'Terms cannot exceed 200 characters')
      .optional()
      .default('')
      .transform((val) => (val ? val.replace(/[\r\n]+/g, ' ').trim() : '')),
    redeemUrl: z.string().trim().optional().default(''),
  })
  .transform(({ code, description, terms, redeemUrl }, ctx) => {
    // If redeem URL is provided, validate as web URL and inject coupon query parameter
    if (redeemUrl) {
      try {
        const normalized = normalizeWebUrl(redeemUrl, false);
        const url = new URL(normalized);
        // Deterministically set or overwrite coupon parameter
        url.searchParams.set('coupon', code);
        return url.toString();
      } catch (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err instanceof Error ? err.message : 'Invalid redeem URL format',
        });
        return z.NEVER;
      }
    }

    // Deterministic multiline plain text coupon fallback
    const lines = [`COUPON: ${code}`, `OFFER: ${description}`];
    if (terms) {
      lines.push(`TERMS: ${terms}`);
    }
    return lines.join('\n');
  });

export type CouponPayloadOutput = z.infer<typeof couponPayloadSchema>;

// ============================================================================
// 6. App Link Payload Schema
// ============================================================================

export type AppPlatform = 'ios' | 'android';

export interface AppPayloadInput {
  platform: AppPlatform;
  input: string;
}

export const appPayloadSchema = z
  .object({
    platform: z.enum(['ios', 'android']),
    input: z.string().trim().min(1, 'Please enter an App ID, Package Name, or Store URL'),
  })
  .transform(({ platform, input }, ctx) => {
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input);

    if (platform === 'ios') {
      // Check if full URL
      if (hasScheme || input.includes('apple.com')) {
        let parsed: URL;
        try {
          parsed = new URL(hasScheme ? input : `https://${input}`);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please enter a valid Apple App Store URL or numeric App ID',
          });
          return z.NEVER;
        }

        const host = parsed.hostname.toLowerCase();
        if (host !== 'apps.apple.com' && host !== 'itunes.apple.com') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'URL must be an official Apple App Store link (apps.apple.com)',
          });
          return z.NEVER;
        }

        const match = parsed.pathname.match(/id(\d{9,11})/i);
        if (!match) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'App Store URL must contain a valid numeric App ID (e.g. /id123456789)',
          });
          return z.NEVER;
        }
        return `https://apps.apple.com/app/id${match[1]}`;
      }

      // Direct numeric App ID
      if (!/^\d{9,11}$/.test(input)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Apple App ID must be a 9 to 11 digit numeric identifier',
        });
        return z.NEVER;
      }
      return `https://apps.apple.com/app/id${input}`;
    }

    // Android Google Play
    if (hasScheme || input.includes('play.google.com')) {
      let parsed: URL;
      try {
        parsed = new URL(hasScheme ? input : `https://${input}`);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid Google Play Store URL or package name',
        });
        return z.NEVER;
      }

      const host = parsed.hostname.toLowerCase();
      if (host !== 'play.google.com') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'URL must be an official Google Play link (play.google.com)',
        });
        return z.NEVER;
      }

      const pkg = parsed.searchParams.get('id');
      if (!pkg || !/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(pkg)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Google Play URL missing valid package name in "?id=" parameter',
        });
        return z.NEVER;
      }
      return `https://play.google.com/store/apps/details?id=${pkg}`;
    }

    // Direct Package Name (Reverse-DNS)
    if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(input)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Google Play package name must follow reverse-DNS notation (e.g. com.example.app)',
      });
      return z.NEVER;
    }
    return `https://play.google.com/store/apps/details?id=${input}`;
  });

export type AppPayloadOutput = z.infer<typeof appPayloadSchema>;

// ============================================================================
// 7. PDF Direct URL Payload Schema
// ============================================================================

/**
 * Validates direct HTTPS PDF URLs.
 * Preserves query parameters, access tokens, and hash anchors.
 * Client-side validation establishes HTTPS URL syntax; it does NOT prove file existence,
 * MIME type, server availability, or CORS permissions.
 */
export const pdfPayloadSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a direct HTTPS URL to your PDF document')
  .max(2048, 'URL exceeds maximum length of 2048 characters')
  .transform((val, ctx) => {
    try {
      return normalizeWebUrl(val, true);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : 'Invalid HTTPS URL format',
      });
      return z.NEVER;
    }
  });

export type PdfPayloadOutput = z.infer<typeof pdfPayloadSchema>;

export function hasPdfExtension(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
}

// ============================================================================
// 8. Image Direct URL Payload Schema
// ============================================================================

const COMMON_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

/**
 * Validates direct HTTPS Image URLs.
 * Preserves query parameters, signed tokens, and hash anchors.
 * Client-side validation establishes HTTPS URL syntax; it does NOT prove file existence,
 * MIME type, server availability, or CORS permissions.
 */
export const imagePayloadSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a direct HTTPS URL to your image file')
  .max(2048, 'URL exceeds maximum length of 2048 characters')
  .transform((val, ctx) => {
    try {
      return normalizeWebUrl(val, true);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : 'Invalid HTTPS URL format',
      });
      return z.NEVER;
    }
  });

export type ImagePayloadOutput = z.infer<typeof imagePayloadSchema>;

export function hasImageExtension(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname.toLowerCase();
    return COMMON_IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext));
  } catch {
    return false;
  }
}
