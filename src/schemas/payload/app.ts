import { z } from 'zod';

export type AppPlatform = 'ios' | 'android';

export interface AppPayloadInput {
  platform: AppPlatform;
  input: string;
}

export const appPayloadSchema = z
  .object({
    platform: z.enum(['ios', 'android']),
    input: z
      .string()
      .trim()
      .min(1, 'Please enter an App ID, Package Name, or Store URL')
      .max(2048, 'Input exceeds maximum length of 2048 characters'),
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
