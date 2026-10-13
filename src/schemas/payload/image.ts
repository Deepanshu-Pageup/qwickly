import { z } from 'zod';
import { normalizeWebUrl } from './shared';

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
