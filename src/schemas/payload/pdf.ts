import { z } from 'zod';
import { normalizeWebUrl } from './shared';

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
